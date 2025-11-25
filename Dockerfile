# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN pnpm build

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar archivos construidos desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3011

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]

