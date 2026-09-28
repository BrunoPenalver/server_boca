# 🚀 Fila Boca Core

Sistema de monitoreo y gestión de colas virtuales para Boca Juniors usando Queue-it.

## 📁 Estructura del Proyecto

```
core/
├── src/
│   ├── controllers/         # Lógica de negocio
│   │   ├── FilaController.ts
│   │   └── StatsController.ts
│   ├── models/             # Modelos de Sequelize
│   │   └── Fila.ts
│   ├── routes/             # Definición de rutas
│   │   └── filas.ts
│   ├── database/           # Configuración de BD
│   │   └── connection.ts
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts
│   └── app.ts             # Aplicación principal
├── config/
├── logs/
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd core
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./database/fila_boca.sqlite
DATABASE_LOGGING=true
```

### 3. Compilar TypeScript

```bash
npm run build
```

## 🚀 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## 📡 API Endpoints

### Filas

- `GET /api/filas` - Obtener todas las filas (con paginación)
- `GET /api/filas/active` - Obtener filas activas
- `GET /api/filas/:ticketId` - Obtener fila específica
- `POST /api/filas` - Crear nueva fila
- `POST /api/filas/batch` - Crear múltiples filas
- `PUT /api/filas/:ticketId` - Actualizar fila
- `PUT /api/filas/:ticketId/complete` - Marcar como completada
- `DELETE /api/filas/:ticketId` - Eliminar fila

### Sistema

- `GET /api/health` - Health check
- `GET /api/stats` - Estadísticas del sistema

## 📊 Ejemplos de Uso

### Crear una nueva fila

```bash
curl -X POST http://localhost:3000/api/filas \\
  -H "Content-Type: application/json" \\
  -d '{
    "ticketId": "abc123-def456-ghi789",
    "cookies": "Queue-it-abc123=...; Queue-it-bocajuniors=...",
    "link": "https://bocajuniors.queue-it.net/...",
    "status": "active"
  }'
```

### Obtener filas activas

```bash
curl http://localhost:3000/api/filas/active
```

### Obtener estadísticas

```bash
curl http://localhost:3000/api/stats
```

## 🗄️ Modelo de Datos

### Fila

```typescript
interface FilaData {
  id?: number;
  ticketId: string;           // ID único del ticket
  cookies: string;            // Cookies de sesión
  link: string;              // URL de la fila
  
  // Datos de Queue-it
  queueNumber?: number;
  usersInLineAheadOfYou?: number;
  usersInQueue?: number;
  expectedServiceTime?: string;
  queuePaused?: boolean;
  whichIsIn?: string;
  progress?: number;          // 0.0 - 1.0
  secondsToStart?: number;
  
  // Gestión interna
  status: 'active' | 'completed' | 'error' | 'paused';
  isReady?: boolean;
  readinessConfidence?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  lastVerifiedAt?: Date;
  completedAt?: Date;
}
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo con auto-recarga
npm run dev

# Compilar TypeScript
npm run build

# Compilar en modo watch
npm run build:watch

# Ejecutar en producción
npm start

# Limpiar builds
npm run clean

# Linting
npm run lint

# Tests
npm test
```

## 📝 Logs

Los logs se guardan en:
- Consola: Para desarrollo
- `logs/core.log`: Para producción

## 🔄 Estados de Fila

- **active**: Fila activa siendo monitoreada
- **completed**: Fila completada exitosamente
- **error**: Error en el procesamiento
- **paused**: Fila pausada temporalmente

## 🎯 Configuración de Detección

El sistema detecta automáticamente cuando una fila está lista basándose en:

1. **whichIsIn** contiene palabras clave ("menos de un minuto", "ready", etc.)
2. **progress** >= 95%
3. **secondsToStart** <= 60 segundos
4. Combinaciones de los criterios anteriores

## 🚨 Códigos de Error

- `400`: Bad Request - Datos faltantes o inválidos
- `404`: Not Found - Fila no encontrada
- `409`: Conflict - Fila ya existe
- `500`: Internal Server Error - Error del servidor

## 🔗 Integración

Este core está diseñado para integrarse con:

1. **Generador de filas**: Envía nuevas filas via POST
2. **Auto-completer**: Recibe notificaciones de filas listas
3. **Dashboard**: Consume datos para visualización

## 📈 Monitoreo

### Health Check

```bash
curl http://localhost:3000/api/health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2025-11-07T20:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "totalFilas": 42
  }
}
```

### Estadísticas

```bash
curl http://localhost:3000/api/stats
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "active": 85,
    "completed": 15,
    "ready": 3,
    "averageProgress": 0.65,
    "uptime": 3600,
    "memoryUsage": {
      "rss": 52428800,
      "heapTotal": 29360128,
      "heapUsed": 20123456,
      "external": 1024
    }
  }
}
```

## 🛡️ Seguridad

- CORS habilitado para todos los orígenes (desarrollo)
- Validación de datos de entrada
- Rate limiting configurado
- Manejo seguro de errores

## 🤝 Contribución

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/nueva-feature`
3. Commit: `git commit -am 'Agregar nueva feature'`
4. Push: `git push origin feature/nueva-feature`
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Fila Boca Core v1.0.0** - Sistema de monitoreo de colas virtuales para Boca Juniors