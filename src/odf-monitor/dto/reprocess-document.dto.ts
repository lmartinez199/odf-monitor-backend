import { ApiProperty } from "@nestjs/swagger";

export class ReprocessDocumentDto {
  @ApiProperty({ description: "ID del documento a re-ejecutar" })
  documentId!: string;

  @ApiProperty({ description: "URL del endpoint del backend principal para re-ejecutar", required: false })
  backendUrl?: string;
}

export class ReprocessDocumentResponseDto {
  @ApiProperty({ description: "Indica si la re-ejecución fue exitosa" })
  success!: boolean;

  @ApiProperty({ description: "Mensaje de respuesta" })
  message!: string;
}

