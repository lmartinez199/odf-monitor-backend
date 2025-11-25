import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { OdfDocumentDocument, OdfDocumentEntity } from "../entities/odf-document.entity";
import { OdfDocumentModel } from "../models/odf-document.model";

export interface FindDocumentsFilters {
  competitionCode?: string;
  documentCode?: string;
  documentType?: string;
  documentSubtype?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export class OdfDocumentRepository {
  constructor(
    @InjectModel(OdfDocumentEntity.name)
    private readonly model: Model<OdfDocumentDocument>,
  ) {}

  async findAll(
    filters?: FindDocumentsFilters,
    pagination?: PaginationOptions,
  ): Promise<{ documents: OdfDocumentModel[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filters?.competitionCode) {
      query.competitionCode = filters.competitionCode;
    }

    if (filters?.documentCode) {
      query.documentCode = new RegExp(filters.documentCode, "i");
    }

    if (filters?.documentType) {
      query.documentType = filters.documentType;
    }

    if (filters?.documentSubtype) {
      query.documentSubtype = filters.documentSubtype;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      query.date = {
        $gte: filters.dateFrom,
        $lte: filters.dateTo,
      } as Record<string, unknown>;
      // Limpiar propiedades undefined
      if (!filters.dateFrom) {
        delete (query.date as Record<string, unknown>).$gte;
      }
      if (!filters.dateTo) {
        delete (query.date as Record<string, unknown>).$lte;
      }
    }

    const total = await this.model.countDocuments(query);

    let queryBuilder = this.model.find(query).sort({ date: -1 });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.pageSize;
      queryBuilder = queryBuilder.skip(skip).limit(pagination.pageSize);
    }

    const documents = await queryBuilder.exec();

    return {
      documents: documents.map((doc) => this.toModel(doc)),
      total,
    };
  }

  async findById(id: string): Promise<OdfDocumentModel | null> {
    const document = await this.model.findById(id).exec();
    return document ? this.toModel(document) : null;
  }

  async findByDocumentCode(documentCode: string): Promise<OdfDocumentModel[]> {
    const documents = await this.model
      .find({
        documentCode: new RegExp(documentCode, "i"),
      })
      .sort({ date: -1 })
      .exec();

    return documents.map((doc) => this.toModel(doc));
  }

  async findByContentHash(contentHash: string): Promise<OdfDocumentModel | null> {
    const document = await this.model.findOne({ contentHash }).exec();
    return document ? this.toModel(document) : null;
  }

  private toModel(entity: OdfDocumentDocument): OdfDocumentModel {
    const entityWithTimestamps = entity as OdfDocumentDocument & {
      createdAt?: Date;
      updatedAt?: Date;
    };

    return new OdfDocumentModel({
      _id: entity._id.toString(),
      competitionCode: entity.competitionCode,
      documentCode: entity.documentCode,
      documentType: entity.documentType,
      documentSubtype: entity.documentSubtype,
      version: entity.version,
      date: entity.date,
      content: entity.content,
      resultStatus: entity.resultStatus,
      unitCodes: entity.unitCodes,
      contentHash: entity.contentHash,
      createdAt: entityWithTimestamps.createdAt,
      updatedAt: entityWithTimestamps.updatedAt,
    });
  }
}
