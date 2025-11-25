import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

import { OdfDocumentService } from "../services/odf-document.service";
import {
  OdfDocumentResponseDto,
  OdfDocumentListResponseDto,
  DocumentComparisonDto,
} from "../dto/odf-document-response.dto";
import {
  ReprocessDocumentDto,
  ReprocessDocumentResponseDto,
} from "../dto/reprocess-document.dto";

@ApiTags("ODF Documents")
@Controller("odf-documents")
export class OdfDocumentController {
  constructor(private readonly service: OdfDocumentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Listar documentos ODF",
    description: "Obtiene una lista paginada de documentos ODF con filtros opcionales",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de documentos obtenida exitosamente",
    type: OdfDocumentListResponseDto,
  })
  @ApiQuery({ name: "page", required: false, type: Number, description: "Número de página" })
  @ApiQuery({ name: "pageSize", required: false, type: Number, description: "Tamaño de página" })
  @ApiQuery({ name: "competitionCode", required: false, type: String, description: "Filtrar por código de competencia" })
  @ApiQuery({ name: "documentCode", required: false, type: String, description: "Filtrar por código de documento" })
  @ApiQuery({ name: "documentType", required: false, type: String, description: "Filtrar por tipo de documento" })
  @ApiQuery({ name: "documentSubtype", required: false, type: String, description: "Filtrar por subtipo de documento" })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("competitionCode") competitionCode?: string,
    @Query("documentCode") documentCode?: string,
    @Query("documentType") documentType?: string,
    @Query("documentSubtype") documentSubtype?: string,
  ): Promise<OdfDocumentListResponseDto> {
    const filters = {
      ...(competitionCode && { competitionCode }),
      ...(documentCode && { documentCode }),
      ...(documentType && { documentType }),
      ...(documentSubtype && { documentSubtype }),
    };

    const pagination =
      page && pageSize
        ? {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
          }
        : undefined;

    return this.service.findAll(filters, pagination);
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Obtener documento por ID",
    description: "Obtiene un documento ODF específico por su ID",
  })
  @ApiResponse({
    status: 200,
    description: "Documento obtenido exitosamente",
    type: OdfDocumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Documento no encontrado",
  })
  async findById(@Param("id") id: string): Promise<OdfDocumentResponseDto> {
    return this.service.findById(id);
  }

  @Get(":id/parsed")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Obtener contenido parseado del documento",
    description: "Obtiene el contenido del documento parseado (XML a JSON o JSON)",
  })
  @ApiResponse({
    status: 200,
    description: "Contenido parseado obtenido exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Documento no encontrado",
  })
  async getParsedContent(@Param("id") id: string): Promise<unknown> {
    return this.service.getParsedContent(id);
  }

  @Get("document-code/:documentCode")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Buscar documentos por código",
    description: "Busca todos los documentos que coincidan con el código proporcionado",
  })
  @ApiResponse({
    status: 200,
    description: "Documentos encontrados",
    type: [OdfDocumentResponseDto],
  })
  async findByDocumentCode(
    @Param("documentCode") documentCode: string,
  ): Promise<OdfDocumentResponseDto[]> {
    return this.service.findByDocumentCode(documentCode);
  }

  @Get("compare/:id1/:id2")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Comparar dos documentos",
    description: "Compara dos documentos ODF y muestra las diferencias",
  })
  @ApiResponse({
    status: 200,
    description: "Comparación realizada exitosamente",
    type: DocumentComparisonDto,
  })
  @ApiResponse({
    status: 404,
    description: "Uno o ambos documentos no encontrados",
  })
  async compareDocuments(
    @Param("id1") id1: string,
    @Param("id2") id2: string,
  ): Promise<DocumentComparisonDto> {
    return this.service.compareDocuments(id1, id2);
  }

  @Post(":id/reprocess")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Re-ejecutar procesamiento de documento",
    description: "Re-ejecuta el procesamiento de un documento ODF en el backend principal",
  })
  @ApiResponse({
    status: 200,
    description: "Re-ejecución iniciada",
    type: ReprocessDocumentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Documento no encontrado",
  })
  async reprocessDocument(
    @Param("id") id: string,
    @Body() dto?: ReprocessDocumentDto,
  ): Promise<ReprocessDocumentResponseDto> {
    return this.service.reprocessDocument(id, dto?.backendUrl);
  }
}

