import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { ConfigService } from "./config";
import { logApplicationInfo } from "./shared/utils/app-logger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: configService.get("FRONTEND_URL"),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const globalPrefix = configService.get("GLOBAL_PREFIX");
  app.setGlobalPrefix(globalPrefix);

  // Configurar Swagger solo en desarrollo
  let shouldDisplaySwagger = false;
  if (configService.isDevelopment) {
    const config = new DocumentBuilder()
      .setTitle("ODF Monitor API")
      .setDescription("API para monitoreo y visualización de documentos ODF")
      .setVersion("1.0")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
    shouldDisplaySwagger = true;
  }

  await app.listen(configService.get("PORT"));

  // Log application information
  const serverUrl = await app.getUrl();
  logApplicationInfo({
    baseUrl: serverUrl.toString(),
    globalPrefix,
    port: configService.get("PORT"),
    environment: configService.get("NODE_ENV"),
    mongodbUri: configService.get("MONGODB_URI"),
    shouldDisplaySwagger,
  });
}

bootstrap().catch((error) => {
  const logger = new Logger("NestApplication");
  logger.error("Failed to start application:", error);
  process.exit(1);
});
