import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const globalPrefix = process.env.GLOBAL_PREFIX || "api";
  app.setGlobalPrefix(globalPrefix);

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle("ODF Monitor API")
    .setDescription("API para monitoreo y visualización de documentos ODF")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3011;
  await app.listen(port);
  console.log(`🚀 ODF Monitor Backend ejecutándose en: http://localhost:${port}/${globalPrefix}`);
  console.log(`📚 Swagger disponible en: http://localhost:${port}/api/docs`);
}

void bootstrap();
