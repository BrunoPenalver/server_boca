FROM node:20-alpine

# Instalar herramientas de compilación para sqlite3
RUN apk add --no-cache python3 make g++ sqlite curl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Limpiar cache y rebuild sqlite3 en el contenedor
RUN npm ci && npm rebuild sqlite3

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]