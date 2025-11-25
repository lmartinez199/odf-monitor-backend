#!/usr/bin/env node

/**
 * Script para formatear automáticamente el body de los commits
 * Divide las líneas largas del body para que no excedan el límite configurado
 */

import { readFileSync, writeFileSync } from "node:fs";

// Límite configurable de caracteres por línea en el body del commit
const MAX_LINE_LENGTH = 100;

/**
 * Divide una línea larga en múltiples líneas respetando palabras completas
 */
function wrapLine(line, maxLength) {
  if (line.length <= maxLength) {
    return [line];
  }

  const words = line.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    // Si la palabra sola es más larga que el límite, la dividimos forzadamente
    if (word.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = "";
      }

      // Dividir palabra larga en chunks
      for (let i = 0; i < word.length; i += maxLength) {
        lines.push(word.slice(i, i + maxLength));
      }
      continue;
    }

    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length <= maxLength) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Formatea el mensaje de commit
 */
function formatCommitMessage(message) {
  const lines = message.split("\n");
  const formattedLines = [];

  let inBody = false;
  let headerProcessed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Primera línea no vacía es el header
    if (!headerProcessed && line.trim()) {
      formattedLines.push(line);
      headerProcessed = true;
      continue;
    }

    // Línea vacía después del header marca el inicio del body
    if (headerProcessed && !inBody && !line.trim()) {
      formattedLines.push(line);
      inBody = true;
      continue;
    }

    // Si estamos en el body, aplicar formateo
    if (inBody && line.trim()) {
      const wrappedLines = wrapLine(line, MAX_LINE_LENGTH);
      formattedLines.push(...wrappedLines);
    } else {
      // Mantener líneas vacías y cualquier otra cosa
      formattedLines.push(line);
    }
  }

  return formattedLines.join("\n");
}

function main() {
  const commitMsgFile = process.argv[2];

  if (!commitMsgFile) {
    console.error(
      "Error: Se requiere la ruta del archivo de mensaje de commit",
    );
    process.exit(1);
  }

  try {
    const originalMessage = readFileSync(commitMsgFile, "utf8");
    const formattedMessage = formatCommitMessage(originalMessage);

    // Solo escribir si hay cambios
    if (originalMessage !== formattedMessage) {
      writeFileSync(commitMsgFile, formattedMessage);
      console.log(
        `✓ Mensaje de commit formateado (límite: ${MAX_LINE_LENGTH} caracteres)`,
      );
    }
  } catch (error) {
    console.error("Error al formatear el mensaje de commit:", error);
    process.exit(1);
  }
}

main();

