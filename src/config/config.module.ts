import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";

import { ConfigService } from "./config.service";
import { validateEnv } from "./env.validation";

/**
 * Módulo de configuración
 * Encapsula la configuración de NestJS ConfigModule con validación de Zod
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv, // Usa nuestra función de validación de Zod
      cache: true, // Cachea la configuración
      expandVariables: true, // Permite la expansión de variables en los archivos .env
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
