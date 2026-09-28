import { Request, Response } from 'express';
import Fila from '../models/Fila';

/**
 * GET /api/stats - Obtener estadísticas del sistema
 */
export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Obtener estadísticas básicas de filas con consultas directas
    const [totalCount, activeCount, completedCount, readyCount] = await Promise.all([
      Fila.count(),
      Fila.count({ where: { estado: 'active' } }),
      Fila.count({ where: { estado: 'completed' } }),
      Fila.count({ where: { isRedirected: true } }),
    ]);

    // Agregar estadísticas del sistema
    const systemStats = {
      filas: {
        total: totalCount,
        active: activeCount,
        completed: completedCount,
        ready: readyCount,
        pending: activeCount - readyCount,
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: systemStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * GET /health - Health check del sistema
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar conexión a base de datos haciendo una consulta simple
    const totalFilas = await Fila.count();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      services: {
        database: 'connected',
        totalFilas: totalFilas,
      },
    });
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
};