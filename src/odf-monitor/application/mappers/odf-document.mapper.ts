import { Injectable } from "@nestjs/common";

import { OdfDocumentDocument } from "../../infrastructure/entities/odf-document.entity";
import { OdfDocumentModel } from "../../domain/models/odf-document.model";
import { OdfDocumentResponseDto } from "../../presentation/dto/odf-document-response.dto";

@Injectable()
export class OdfDocumentMapper {
  /**
   * Mapea una entidad de documento ODF (Mongoose) a un modelo de dominio
   * @param entity - Entidad de documento ODF de Mongoose
   * @returns Modelo de dominio del documento
   */
  entityToModel(entity: OdfDocumentDocument): OdfDocumentModel {
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

  /**
   * Mapea un array de entidades de documentos ODF a un array de modelos
   * @param entities - Array de entidades de documentos ODF
   * @returns Array de modelos de dominio
   */
  entityToModelArray(entities: OdfDocumentDocument[]): OdfDocumentModel[] {
    return entities.map((entity) => this.entityToModel(entity));
  }

  /**
   * Mapea un modelo de documento ODF a su DTO de respuesta
   * @param model - Modelo de documento ODF
   * @returns DTO de respuesta del documento
   */
  modelToDto(model: OdfDocumentModel): OdfDocumentResponseDto {
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

  /**
   * Mapea un array de modelos de documentos ODF a un array de DTOs
   * @param models - Array de modelos de documentos ODF
   * @returns Array de DTOs de respuesta
   */
  modelToDtoArray(models: OdfDocumentModel[]): OdfDocumentResponseDto[] {
    return models.map((model) => this.modelToDto(model));
  }

  /**
   * Mapea directamente una entidad de documento ODF a su DTO de respuesta
   * @param entity - Entidad de documento ODF de Mongoose
   * @returns DTO de respuesta del documento
   */
  entityToDto(entity: OdfDocumentDocument): OdfDocumentResponseDto {
    const model = this.entityToModel(entity);
    return this.modelToDto(model);
  }

  /**
   * Mapea un array de entidades de documentos ODF a un array de DTOs
   * @param entities - Array de entidades de documentos ODF
   * @returns Array de DTOs de respuesta
   */
  entityToDtoArray(entities: OdfDocumentDocument[]): OdfDocumentResponseDto[] {
    return entities.map((entity) => this.entityToDto(entity));
  }
}
