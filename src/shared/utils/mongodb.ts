// Extrae host y nombre de base de datos de una URI de MongoDB
export function parseMongoUri(uri: string): { host: string; dbName: string } {
  try {
    const cleaned = uri.replace(/^mongodb(?:\+srv)?:\/\//, "");
    // Separa credenciales si existen
    const atIndex = cleaned.indexOf("@");
    const noCreds = atIndex !== -1 ? cleaned.slice(atIndex + 1) : cleaned;
    // Separa host/puerto de la base de datos y parámetros
    const [hostAndPort, ...rest] = noCreds.split("/");
    // El nombre de la base de datos puede venir después de la primera barra
    let dbName = rest.join("/");
    // Si hay parámetros, los quitamos
    if (dbName.includes("?")) {
      dbName = dbName.split("?")[0];
    }
    return {
      host: hostAndPort,
      dbName: dbName || "",
    };
  } catch {
    return { host: "", dbName: "" };
  }
}
