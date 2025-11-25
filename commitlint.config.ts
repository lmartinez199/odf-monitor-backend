import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // Nueva característica
        "fix", // Corrección de errores
        "docs", // Documentación
        "style", // Cambios de estilo (formato, espacios, etc.)
        "refactor", // Refactorización del código
        "perf", // Mejoras de rendimiento
        "test", // Adición o modificación de tests
        "chore", // Tareas de mantenimiento
        "ci", // Cambios en la integración continua
        "build", // Cambios que afectan el sistema de build
        "revert", // Revierte un commit anterior
      ],
    ],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [0],
    "subject-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "body-max-line-length": [0], // Deshabilitado - manejado por script automático
  },
};

export default config;
