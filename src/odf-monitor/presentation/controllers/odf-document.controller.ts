import { Controller, Get, Param, Query, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

import { OdfDocumentService } from "../../application/services/odf-document.service";
import {
  OdfDocumentResponseDto,
  OdfDocumentListResponseDto,
  DocumentComparisonDto,
  DisciplineListResponseDto,
} from "../dto/odf-document-response.dto";

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
  @ApiQuery({
    name: "competitionCode",
    required: false,
    type: String,
    description: "Filtrar por código de competencia",
  })
  @ApiQuery({
    name: "documentCode",
    required: false,
    type: String,
    description: "Filtrar por código de documento",
  })
  @ApiQuery({
    name: "documentType",
    required: false,
    type: String,
    description: "Filtrar por tipo de documento",
  })
  @ApiQuery({
    name: "documentSubtype",
    required: false,
    type: String,
    description: "Filtrar por subtipo de documento",
  })
  @ApiQuery({
    name: "discipline",
    required: false,
    type: String,
    description:
      "Filtrar por disciplina (código de 3 caracteres, ej: ATH, MTI). Debe existir en la colección discipline-settings.",
  })
  async findAll(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("competitionCode") competitionCode?: string,
    @Query("documentCode") documentCode?: string,
    @Query("documentType") documentType?: string,
    @Query("documentSubtype") documentSubtype?: string,
    @Query("discipline") discipline?: string,
  ): Promise<OdfDocumentListResponseDto> {
    const filters = {
      ...(competitionCode && { competitionCode }),
      ...(documentCode && { documentCode }),
      ...(documentType && { documentType }),
      ...(documentSubtype && { documentSubtype }),
      ...(discipline && { discipline }),
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

  @Get("disciplines/list")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Listar disciplinas disponibles",
    description:
      "Obtiene una lista de todos los códigos de disciplinas disponibles en la base de datos",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de disciplinas obtenida exitosamente",
    type: DisciplineListResponseDto,
  })
  async getDisciplines(): Promise<DisciplineListResponseDto> {
    const disciplines = await this.service.getAllDisciplines();
    return { disciplines };
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
    summary: "Obtener documentos XML para comparación",
    description:
      "Obtiene los dos documentos XML originales (como string) para mostrar en un editor XML y comparación visual en el frontend. Solo soporta documentos XML.",
  })
  @ApiResponse({
    status: 200,
    description: "Documentos XML obtenidos exitosamente para comparación",
    type: DocumentComparisonDto,
  })
  @ApiResponse({
    status: 404,
    description: "Uno o ambos documentos no encontrados",
  })
  @ApiResponse({
    status: 400,
    description:
      "Uno o ambos documentos no son XML. La comparación solo está disponible para documentos XML.",
  })
  async compareDocuments(
    @Param("id1") id1: string,
    @Param("id2") id2: string,
  ): Promise<DocumentComparisonDto> {
    return this.service.compareDocuments(id1, id2);
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
}
