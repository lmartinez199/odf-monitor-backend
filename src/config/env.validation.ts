import { z } from "zod";

/**
 * Esquema de validación de variables de entorno usando Zod
 *
 * Este esquema define y valida todas las variables de entorno necesarias
 * para el funcionamiento correcto de la aplicación. Cada variable tiene
 * restricciones específicas que debe cumplir para considerarse válida.
 */
export const envSchema = z.object({
  // Application
  /**
   * Puerto en el que se ejecutará el servidor HTTP
   * Debe ser un número entero positivo
   * Ejemplo: "3011"
   */
  PORT: z.string().default("3011").transform(Number).pipe(z.number().int().positive()),

  /**
   * Entorno de ejecución de la aplicación
   * Valores permitidos: "development", "production", "test"
   * Por defecto: "development"
   */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /**
   * Prefijo global para todas las rutas de la API
   * Se añade automáticamente antes de cada ruta
   * Por defecto: "api"
   * Ejemplo: Si GLOBAL_PREFIX="api", una ruta "/users" será accesible en "/api/users"
   */
  GLOBAL_PREFIX: z.string().default("api"),

  // Database
  /**
   * URI de conexión a la base de datos MongoDB
   * Debe ser una URI válida con el formato: mongodb://[username:password@]host[:port][/database]
   * Ejemplo: "mongodb://localhost:27017/my-database" o "mongodb+srv://user:pass@cluster.mongodb.net/my-database"
   */
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, {
    message: "Debe ser una URI válida de MongoDB",
  }),

  /**
   * URL del frontend para configuración de CORS
   * Por defecto: "http://localhost:3000"
   */
  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
});

/**
 * Definición de tipos para variables de entorno
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno contra el esquema definido
 * @param config - Las variables de entorno a validar
 * @returns Las variables de entorno validadas
 */
export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => {
        const path = err.path.length > 0 ? err.path.join(".") : "config";
        return `${path}: ${err.message}`;
      })
      .join(", ");
    console.error("❌ Invalid environment variables:", errorMessages);
    throw new Error(`Configuración de variables de entorno inválida: ${errorMessages}`);
  }

  return result.data;
}
