import { Logger } from "@nestjs/common";

import { parseMongoUri } from "./mongodb";

/**
 * Formatea una URL reemplazando [::1] con localhost para una mejor legibilidad
 * @param url La URL a formatear
 * @returns La URL formateada
 */
export function formatUrl(url: string): string {
  if (url.includes("[::1]")) {
    return url.replace("[::1]", "localhost");
  }
  return url;
}

/**
 * Registra la información de inicio de la aplicación
 * @param options Opciones de configuración para el registro
 */
export function logApplicationInfo(options: {
  baseUrl: string;
  globalPrefix?: string;
  port: number;
  environment: string;
  mongodbUri: string;
  shouldDisplaySwagger: boolean;
}): void {
  const logger = new Logger("NestApplication");
  const { baseUrl, globalPrefix, port, environment, mongodbUri, shouldDisplaySwagger } = options;

  // Formatear la URL base
  const formattedBaseUrl = formatUrl(baseUrl);

  // Construir URLs de API y Swagger
  const apiUrl = globalPrefix ? `${formattedBaseUrl}/${globalPrefix}` : formattedBaseUrl;
  const swaggerUrl = `${formattedBaseUrl}/docs`;

  // Registrar información de la base de datos
  const { host, dbName } = parseMongoUri(mongodbUri);
  logger.log("Base de datos configurada:");
  logger.log(`  Host: ${host}`);
  logger.log(`  Base de datos: ${dbName}`);

  // Registrar información de la aplicación
  logger.log("\n");
  logger.log("🚀 Application is running!");
  logger.log(`🌍 Entorno: ${environment}`);
  logger.log(`🔌 Puerto: ${port}`);
  logger.log(`🌐 API disponible en: ${apiUrl}`);
  if (shouldDisplaySwagger) {
    logger.log(`📚 Documentación Swagger disponible en: ${swaggerUrl}`);
  }
  logger.log("\n");
}
