import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";

import { OdfDocumentRepository } from "../repositories/odf-document.repository";
import { DisciplineSettingsRepository } from "../repositories/discipline-settings.repository";
import { OdfDocumentModel } from "../models/odf-document.model";
import {
  OdfDocumentListResponseDto,
  OdfDocumentResponseDto,
  DocumentComparisonDto,
} from "../dto/odf-document-response.dto";
import type {
  FindDocumentsFilters,
  PaginationOptions,
} from "../repositories/odf-document.repository";

@Injectable()
export class OdfDocumentService {
  private readonly xmlParser: XMLParser;
  private disciplinesCache?: { data: string[]; expiresAt: number };
  private readonly DISCIPLINES_CACHE_TTL = 60 * 60 * 1000; // 1 hora en milisegundos

  constructor(
    private readonly repository: OdfDocumentRepository,
    private readonly disciplineRepository: DisciplineSettingsRepository,
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
    // Validar que la disciplina existe si se proporciona
    if (filters?.discipline) {
      const disciplineExists = await this.disciplineRepository.exists(filters.discipline);
      if (!disciplineExists) {
        throw new BadRequestException(
          `La disciplina "${filters.discipline}" no existe en la base de datos.`,
        );
      }
    }

    const { documents, total } = await this.repository.findAll(filters, pagination);

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

  async findByDocumentCode(documentCode: string): Promise<OdfDocumentResponseDto[]> {
    const documents = await this.repository.findByDocumentCode(documentCode);
    return documents.map((doc) => this.toDto(doc));
  }

  async compareDocuments(document1Id: string, document2Id: string): Promise<DocumentComparisonDto> {
    const doc1 = await this.repository.findById(document1Id);
    const doc2 = await this.repository.findById(document2Id);

    if (!doc1) {
      throw new NotFoundException(`Documento con ID ${document1Id} no encontrado`);
    }
    if (!doc2) {
      throw new NotFoundException(`Documento con ID ${document2Id} no encontrado`);
    }

    // Validar que ambos documentos sean XML
    const isXml1 = this.isXml(doc1.content);
    const isXml2 = this.isXml(doc2.content);

    if (!isXml1) {
      throw new Error(
        `El documento ${document1Id} no es XML. La comparación solo está disponible para documentos XML.`,
      );
    }

    if (!isXml2) {
      throw new Error(
        `El documento ${document2Id} no es XML. La comparación solo está disponible para documentos XML.`,
      );
    }

    // Retornar XML original como string para mostrar en editor
    return {
      document1: {
        id: doc1._id,
        xmlContent: doc1.content,
      },
      document2: {
        id: doc2._id,
        xmlContent: doc2.content,
      },
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
        throw new Error(
          `Error al parsear XML: ${error instanceof Error ? error.message : "Error desconocido"}`,
        );
      }
    } else {
      try {
        return JSON.parse(document.content);
      } catch (error) {
        throw new Error(
          `Error al parsear JSON: ${error instanceof Error ? error.message : "Error desconocido"}`,
        );
      }
    }
  }

  private isXml(content: string): boolean {
    const trimmed = content.trim();
    return trimmed.startsWith("<?xml") || trimmed.startsWith("<OdfBody");
  }

  /**
   * Obtiene solo las disciplinas que tienen documentos XML asociados
   * Valida que las disciplinas existan en la colección discipline-settings
   * Optimizado: usa una sola consulta para validar todas las disciplinas
   * Con cache de 1 hora para mejorar el rendimiento
   */
  async getAllDisciplines(): Promise<string[]> {
    // Verificar si hay cache válido
    const now = Date.now();
    if (this.disciplinesCache && this.disciplinesCache.expiresAt > now) {
      return this.disciplinesCache.data;
    }

    // Obtener disciplinas que tienen documentos XML
    const disciplinesWithDocuments = await this.repository.findDisciplinesWithDocuments();

    if (disciplinesWithDocuments.length === 0) {
      // Cachear resultado vacío también
      this.disciplinesCache = {
        data: [],
        expiresAt: now + this.DISCIPLINES_CACHE_TTL,
      };
      return [];
    }

    // Validar todas las disciplinas en una sola consulta (optimización)
    const existingDisciplines =
      await this.disciplineRepository.findExistingDisciplines(disciplinesWithDocuments);

    // Filtrar solo las que existen y ordenar
    const validDisciplines = disciplinesWithDocuments
      .filter((discipline) => existingDisciplines.has(discipline))
      .sort();

    // Guardar en cache
    this.disciplinesCache = {
      data: validDisciplines,
      expiresAt: now + this.DISCIPLINES_CACHE_TTL,
    };

    return validDisciplines;
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
