#!/bin/bash

# Script para ejecutar Fila Boca Core con Docker

echo "🚀 Iniciando Fila Boca Core..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

echo "Borrando contenedores e imágenes antiguas..."

docker-compose down

# Construir y ejecutar con Docker Compose
echo "📦 Construyendo imagen..." 
docker-compose build --no-cache

echo "🏃 Ejecutando contenedor..."
docker-compose up -d

echo "✅ Fila Boca Core está corriendo!"
echo ""
echo "📍 Endpoints disponibles:"
echo "   - API: http://localhost:3000/api"
echo "   - Health: http://localhost:3000/api/health"
echo "   - Stats: http://localhost:3000/api/stats"
echo ""
echo "📊 Para ver logs: docker-compose logs -f"
echo "🛑 Para detener: docker-compose down"