import { ApiProperty } from "@nestjs/swagger";

export class OdfDocumentResponseDto {
  @ApiProperty({ description: "ID del documento" })
  id!: string;

  @ApiProperty({ description: "Código de competencia" })
  competitionCode!: string;

  @ApiProperty({ description: "Código del documento" })
  documentCode!: string;

  @ApiProperty({ description: "Tipo de documento" })
  documentType!: string;

  @ApiProperty({ description: "Subtipo de documento", required: false })
  documentSubtype?: string;

  @ApiProperty({ description: "Versión del documento" })
  version!: string;

  @ApiProperty({ description: "Fecha del documento" })
  date!: Date;

  @ApiProperty({ description: "Contenido del documento (XML o JSON)" })
  content!: string;

  @ApiProperty({ description: "Estado del resultado", required: false })
  resultStatus?: string;

  @ApiProperty({ description: "Códigos de unidades", required: false, type: [String] })
  unitCodes?: string[];

  @ApiProperty({ description: "Hash del contenido", required: false })
  contentHash?: string;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt!: Date;

  @ApiProperty({ description: "Fecha de actualización" })
  updatedAt!: Date;
}

export class OdfDocumentListResponseDto {
  @ApiProperty({ description: "Lista de documentos", type: [OdfDocumentResponseDto] })
  documents!: OdfDocumentResponseDto[];

  @ApiProperty({ description: "Total de documentos" })
  total!: number;

  @ApiProperty({ description: "Página actual" })
  page!: number;

  @ApiProperty({ description: "Tamaño de página" })
  pageSize!: number;
}

export class DocumentComparisonDto {
  @ApiProperty({
    description: "Documento 1 con contenido XML original",
  })
  document1!: {
    id: string;
    xmlContent: string;
  };

  @ApiProperty({
    description: "Documento 2 con contenido XML original",
  })
  document2!: {
    id: string;
    xmlContent: string;
  };
}
