# Fila Boca Core - Docker

Sistema dockerizado de monitoreo de filas de Boca Juniors.

## 🚀 Ejecución rápida

### Usando Docker Compose (recomendado)
```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Usando Docker directo
```bash
# Construir imagen
docker build -t fila-boca-core .

# Ejecutar contenedor
docker run -d \
  --name fila-boca-core \
  -p 3000:3000 \
  -v fila_database:/app/database \
  fila-boca-core
```

## 📊 Endpoints disponibles

Una vez ejecutándose en http://localhost:3000:

- **API Root**: `GET /`
- **Health Check**: `GET /api/health` 
- **Estadísticas**: `GET /api/stats`
- **Filas**: `GET /api/filas`
- **Filas Activas**: `GET /api/filas/active`

## 🔧 Variables de entorno

- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Entorno de ejecución (default: production)
- `DATABASE_PATH`: Ruta de la base de datos SQLite

## 📁 Volúmenes

- `/app/database`: Base de datos SQLite persistente
- `/app/logs`: Logs de la aplicación (opcional)

## 🛠️ Comandos útiles

```bash
# Ver contenedores corriendo
docker ps

# Acceder al contenedor
docker exec -it fila-boca-core sh

# Ver logs en tiempo real
docker logs -f fila-boca-core

# Reiniciar servicio
docker-compose restart
```