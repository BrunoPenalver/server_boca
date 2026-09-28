import express from 'express';
import { initializeDatabase, closeDatabase } from './database/connection';
import filasRouter from './routes/filas';
import process from 'process';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS simple
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging simple
app.use((req: any, res: any, next: any) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api', filasRouter);

// Página principal simple
app.get('/', (req: any, res: any) => {
  res.json({
    name: 'Fila Boca Core',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      filas: '/api/filas',
      activeFilas: '/api/filas/active'
    }
  });
});

// 404 handler
app.use('*', (req: any, res: any) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
});

// Función principal para inicializar y ejecutar el servidor
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Iniciando Fila Boca Core...');
    
    // Inicializar base de datos
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
      console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
      console.log(`🎯 Filas: http://localhost:${PORT}/api/filas`);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}


startServer();