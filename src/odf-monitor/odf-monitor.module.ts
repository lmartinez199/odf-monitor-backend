import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { MongooseModule } from "@nestjs/mongoose";

import { OdfDocumentEntity, OdfDocumentSchema } from "./entities/odf-document.entity";
import { OdfDocumentRepository } from "./repositories/odf-document.repository";
import { OdfDocumentService } from "./services/odf-document.service";
import { OdfDocumentController } from "./controllers/odf-document.controller";

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: OdfDocumentEntity.name, schema: OdfDocumentSchema },
    ]),
  ],
  controllers: [OdfDocumentController],
  providers: [OdfDocumentRepository, OdfDocumentService],
  exports: [OdfDocumentService],
})
export class OdfMonitorModule {}

