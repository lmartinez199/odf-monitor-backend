import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { OdfDocumentDocument, OdfDocumentEntity } from "../entities/odf-document.entity";
import { OdfDocumentModel } from "../../domain/models/odf-document.model";
import { OdfDocumentMapper } from "../../application/mappers/odf-document.mapper";

export interface FindDocumentsFilters {
  competitionCode?: string;
  documentCode?: string;
  documentType?: string;
  documentSubtype?: string;
  discipline?: string; // Primeros 3 caracteres del documentCode (ej: "MTI")
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
    private readonly mapper: OdfDocumentMapper,
  ) {}

  async findAll(
    filters?: FindDocumentsFilters,
    pagination?: PaginationOptions,
  ): Promise<{ documents: OdfDocumentModel[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filters?.competitionCode) {
      query.competitionCode = filters.competitionCode;
    }

    if (filters?.discipline) {
      // Filtrar por disciplina (primeros 3 caracteres del documentCode)
      // Si se proporciona discipline, tiene prioridad sobre documentCode
      // Escapar caracteres especiales de regex para evitar errores
      const escapedDiscipline = filters.discipline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.documentCode = new RegExp(`^${escapedDiscipline}`, "i");
    } else if (filters?.documentCode) {
      // Si no hay discipline, usar el filtro de documentCode normal
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
      documents: this.mapper.entityToModelArray(documents),
      total,
    };
  }

  async findById(id: string): Promise<OdfDocumentModel | null> {
    const document = await this.model.findById(id).exec();
    return document ? this.mapper.entityToModel(document) : null;
  }

  async findByDocumentCode(documentCode: string): Promise<OdfDocumentModel[]> {
    const documents = await this.model
      .find({
        documentCode: new RegExp(documentCode, "i"),
      })
      .sort({ date: -1 })
      .exec();

    return this.mapper.entityToModelArray(documents);
  }

  async findByContentHash(contentHash: string): Promise<OdfDocumentModel | null> {
    const document = await this.model.findOne({ contentHash }).exec();
    return document ? this.mapper.entityToModel(document) : null;
  }

  /**
   * Obtiene los códigos de disciplinas únicos que tienen documentos XML asociados
   * Extrae los primeros 3 caracteres del documentCode de documentos que son XML
   * @returns Array de códigos de disciplinas únicos (ej: ["ATH", "MTI", "BOX"])
   */
  async findDisciplinesWithDocuments(): Promise<string[]> {
    // Agregación optimizada: usa regex para filtrar XML (más eficiente que $substr en contenido grande)
    // MongoDB puede usar índices de texto si existen, y regex es más rápido para strings grandes
    const result = await this.model
      .aggregate<{ _id: string }>([
        {
          $match: {
            // Filtrar solo documentos XML usando regex (más eficiente)
            // Solo busca al inicio del string, no procesa todo el contenido
            content: {
              $regex: /^(<\?xml|<OdfBody)/,
            },
          },
        },
        {
          $project: {
            // Solo proyectar lo necesario: los primeros 3 caracteres del documentCode
            discipline: {
              $toUpper: {
                $substr: ["$documentCode", 0, 3],
              },
            },
          },
        },
        {
          $match: {
            // Filtrar solo códigos válidos de 3 caracteres
            discipline: { $regex: /^[A-Z]{3}$/ },
          },
        },
        {
          $group: {
            _id: "$discipline",
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .allowDiskUse(true) // Permitir usar disco si la agregación es grande
      .exec();

    return result.map((item) => item._id);
  }
}
