import { Injectable, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { XMLParser } from "fast-xml-parser";
import { ConfigService } from "@nestjs/config";

import { OdfDocumentRepository } from "../repositories/odf-document.repository";
import { OdfDocumentModel } from "../models/odf-document.model";
import {
  OdfDocumentListResponseDto,
  OdfDocumentResponseDto,
  DocumentComparisonDto,
} from "../dto/odf-document-response.dto";
import { ReprocessDocumentResponseDto } from "../dto/reprocess-document.dto";
import type {
  FindDocumentsFilters,
  PaginationOptions,
} from "../repositories/odf-document.repository";

@Injectable()
export class OdfDocumentService {
  private readonly xmlParser: XMLParser;

  constructor(
    private readonly repository: OdfDocumentRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      alwaysCreateTextNode: true,
      textNodeName: "#text",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    });
  }

  async findAll(
    filters?: FindDocumentsFilters,
    pagination?: PaginationOptions,
  ): Promise<OdfDocumentListResponseDto> {
    const { documents, total } = await this.repository.findAll(
      filters,
      pagination,
    );

    return {
      documents: documents.map((doc) => this.toDto(doc)),
      total,
      page: pagination?.page || 1,
      pageSize: pagination?.pageSize || documents.length,
    };
  }

  async findById(id: string): Promise<OdfDocumentResponseDto> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    return this.toDto(document);
  }

  async findByDocumentCode(
    documentCode: string,
  ): Promise<OdfDocumentResponseDto[]> {
    const documents = await this.repository.findByDocumentCode(documentCode);
    return documents.map((doc) => this.toDto(doc));
  }

  async compareDocuments(
    document1Id: string,
    document2Id: string,
  ): Promise<DocumentComparisonDto> {
    const doc1 = await this.repository.findById(document1Id);
    const doc2 = await this.repository.findById(document2Id);

    if (!doc1) {
      throw new NotFoundException(`Documento con ID ${document1Id} no encontrado`);
    }
    if (!doc2) {
      throw new NotFoundException(`Documento con ID ${document2Id} no encontrado`);
    }

    const differences: Record<string, unknown> = {};

    // Comparar campos básicos
    if (doc1.competitionCode !== doc2.competitionCode) {
      differences.competitionCode = {
        document1: doc1.competitionCode,
        document2: doc2.competitionCode,
      };
    }

    if (doc1.documentCode !== doc2.documentCode) {
      differences.documentCode = {
        document1: doc1.documentCode,
        document2: doc2.documentCode,
      };
    }

    if (doc1.documentType !== doc2.documentType) {
      differences.documentType = {
        document1: doc1.documentType,
        document2: doc2.documentType,
      };
    }

    if (doc1.version !== doc2.version) {
      differences.version = {
        document1: doc1.version,
        document2: doc2.version,
      };
    }

    // Comparar contenido (parsear si es XML)
    const isXml1 = this.isXml(doc1.content);
    const isXml2 = this.isXml(doc2.content);

    if (isXml1 && isXml2) {
      try {
        const parsed1 = this.xmlParser.parse(doc1.content);
        const parsed2 = this.xmlParser.parse(doc2.content);
        differences.content = {
          type: "xml",
          parsed1,
          parsed2,
          raw1: doc1.content,
          raw2: doc2.content,
        };
      } catch (error) {
        differences.content = {
          type: "xml",
          error: "Error al parsear XML",
          raw1: doc1.content,
          raw2: doc2.content,
        };
      }
    } else {
      differences.content = {
        type: isXml1 || isXml2 ? "mixed" : "json",
        raw1: doc1.content,
        raw2: doc2.content,
      };
    }

    return {
      document1Id: doc1._id,
      document2Id: doc2._id,
      differences,
    };
  }

  async getParsedContent(id: string): Promise<unknown> {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    const isXml = this.isXml(document.content);

    if (isXml) {
      try {
        return this.xmlParser.parse(document.content);
      } catch (error) {
        throw new Error(`Error al parsear XML: ${error instanceof Error ? error.message : "Error desconocido"}`);
      }
    } else {
      try {
        return JSON.parse(document.content);
      } catch (error) {
        throw new Error(`Error al parsear JSON: ${error instanceof Error ? error.message : "Error desconocido"}`);
      }
    }
  }

  async reprocessDocument(
    documentId: string,
    backendUrl?: string,
  ): Promise<ReprocessDocumentResponseDto> {
    const document = await this.repository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Documento con ID ${documentId} no encontrado`);
    }

    const url = backendUrl || this.configService.get<string>("BACKEND_URL") || "http://localhost:3010";
    const endpoint = `${url}/api/odf/form`;

    try {
      // Crear un buffer del contenido XML/JSON
      const buffer = Buffer.from(document.content, "utf-8");
      const filename = `${document.documentCode}.${this.isXml(document.content) ? "xml" : "json"}`;
      const contentType = this.isXml(document.content) ? "application/xml" : "application/json";

      // Usar FormData de form-data para Node.js
      const FormData = (await import("form-data")).default;
      const formData = new FormData();
      formData.append("file", buffer, {
        filename,
        contentType,
      });

      // Enviar el documento al backend principal para re-procesamiento
      const response = await this.httpService.axiosRef.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 segundos
      }).catch((error) => {
        throw new Error(
          `Error al enviar documento al backend: ${error.response?.data?.message || error.message}`,
        );
      });

      return {
        success: true,
        message: `Documento ${documentId} re-ejecutado exitosamente. Respuesta: ${JSON.stringify(response.data)}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al re-ejecutar documento: ${error instanceof Error ? error.message : "Error desconocido"}`,
      };
    }
  }

  private isXml(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith("<?xml") || trimmed.startsWith("<OdfBody");
  }

  private toDto(model: OdfDocumentModel): OdfDocumentResponseDto {
    return {
      id: model._id,
      competitionCode: model.competitionCode,
      documentCode: model.documentCode,
      documentType: model.documentType,
      documentSubtype: model.documentSubtype,
      version: model.version,
      date: model.date,
      content: model.content,
      resultStatus: model.resultStatus,
      unitCodes: model.unitCodes,
      contentHash: model.contentHash,
      createdAt: model.createdAt || model.date,
      updatedAt: model.updatedAt || model.date,
    };
  }
}

