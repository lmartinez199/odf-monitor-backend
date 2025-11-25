# ODF Monitor Backend

Backend para monitoreo y visualización de documentos ODF.

## Características

- Listar documentos ODF con filtros y paginación
- Ver contenido de documentos (XML/JSON)
- Obtener contenido parseado (XML a JSON)
- Comparar dos documentos
- Buscar documentos por código
- Re-ejecutar procesamiento de documentos

## Instalación

```bash
pnpm install
```

## Configuración

1. Copia el archivo `.env.example` a `.env`
2. Configura la URI de MongoDB (debe ser la misma que el backend principal)

```env
MONGODB_URI=mongodb://localhost:27017/grs-backend
PORT=3011
GLOBAL_PREFIX=api
NODE_ENV=development
BACKEND_URL=http://localhost:3010
```

## Ejecución

```bash
# Desarrollo
pnpm start:dev

# Producción
pnpm build
pnpm start:prod
```

## API

La documentación de la API está disponible en Swagger cuando el servidor está en ejecución:

http://localhost:3011/api/docs

## Endpoints

- `GET /api/odf-documents` - Listar documentos con filtros
- `GET /api/odf-documents/:id` - Obtener documento por ID
- `GET /api/odf-documents/:id/parsed` - Obtener contenido parseado
- `GET /api/odf-documents/document-code/:documentCode` - Buscar por código
- `GET /api/odf-documents/compare/:id1/:id2` - Comparar dos documentos
- `POST /api/odf-documents/:id/reprocess` - Re-ejecutar procesamiento


