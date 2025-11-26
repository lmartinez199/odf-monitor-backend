import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("3011").transform(Number).pipe(z.number().int().positive()),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  GLOBAL_PREFIX: z.string().default("api"),

  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, {
    message: "Debe ser una URI válida de MongoDB",
  }),

  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
});

/**
 * Función de validación personalizada para NestJS ConfigModule
 * Convierte el schema de Zod al formato que espera ConfigModule
 */
export function validate(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (result.success) {
    return result.data;
  }

  const errorMessages = result.error.errors
    .map((err) => {
      const path = err.path.length > 0 ? err.path.join(".") : "config";
      return `${path}: ${err.message}`;
    })
    .join(", ");

  throw new Error(`Configuración de variables de entorno inválida: ${errorMessages}`);
}
