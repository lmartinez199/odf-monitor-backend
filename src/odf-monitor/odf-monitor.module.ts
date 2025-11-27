import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { MongooseModule } from "@nestjs/mongoose";

import {
  OdfDocumentEntity,
  OdfDocumentSchema,
} from "./infrastructure/entities/odf-document.entity";
import {
  DisciplineSettingsEntity,
  DisciplineSettingsSchema,
} from "./infrastructure/entities/discipline-settings.entity";
import { OdfDocumentRepository } from "./infrastructure/repositories/odf-document.repository";
import { DisciplineSettingsRepository } from "./infrastructure/repositories/discipline-settings.repository";
import { OdfDocumentMapper } from "./application/mappers/odf-document.mapper";
import { OdfDocumentService } from "./application/services/odf-document.service";
import { OdfDocumentController } from "./presentation/controllers/odf-document.controller";

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: OdfDocumentEntity.name, schema: OdfDocumentSchema },
      { name: DisciplineSettingsEntity.name, schema: DisciplineSettingsSchema },
    ]),
  ],
  controllers: [OdfDocumentController],
  providers: [
    OdfDocumentRepository,
    DisciplineSettingsRepository,
    OdfDocumentMapper,
    OdfDocumentService,
  ],
  exports: [OdfDocumentService],
})
export class OdfMonitorModule {}
