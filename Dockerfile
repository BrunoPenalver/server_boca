FROM node:20-alpine

# Instalar herramientas de compilación para sqlite3
RUN apk add --no-cache python3 make g++ sqlite curl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias sin auditorías ni avisos de fund
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]