import { Injectable } from "@nestjs/common";
import { ConfigService as NestConfigService } from "@nestjs/config";

import { EnvConfig } from "./env.validation";

/**
 * Servicio de configuración tipado que proporciona acceso a variables de entorno
 */
@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService<EnvConfig, true>) {}

  /**
   * Método genérico para acceder a cualquier configuración con su tipo correcto
   * @param key Clave de la variable de entorno
   * @returns Valor tipado de la configuración
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.configService.get(key, { infer: true });
  }

  /**
   * Verifica si la aplicación está ejecutándose en modo desarrollo
   */
  get isDevelopment(): boolean {
    return this.get("NODE_ENV") === "development";
  }

  /**
   * Verifica si la aplicación está ejecutándose en modo producción
   */
  get isProduction(): boolean {
    return this.get("NODE_ENV") === "production";
  }

  /**
   * Verifica si la aplicación está ejecutándose en modo pruebas
   */
  get isTest(): boolean {
    return this.get("NODE_ENV") === "test";
  }
}
