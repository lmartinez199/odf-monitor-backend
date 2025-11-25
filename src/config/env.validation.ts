import { z } from "zod";

export const envSchema = z.object({
  PORT: z
    .string()
    .default("3011")
    .transform(Number)
    .pipe(z.number().int().positive()),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  GLOBAL_PREFIX: z.string().default("api"),

  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, {
    message: "Debe ser una URI válida de MongoDB",
  }),

  FRONTEND_URL: z.string().optional().default("http://localhost:3000"),
});

