import express from 'express';
import { 
  getAllFilas, 
  getActiveFilas, 
  getFilaById, 
  createFila, 
  createFilasBatch, 
  updateFila, 
  completeFila, 
  deleteFila 
} from '../controllers/FilaController';
import { getSystemStats, healthCheck } from '../controllers/StatsController';

const router = express.Router();

// === RUTAS DE FILAS ===
// GET /api/filas - Obtener todas las filas con paginación y filtros
router.get('/filas', getAllFilas);

// GET /api/filas/active - Obtener solo filas activas (optimizado para dashboard)
router.get('/filas/active', getActiveFilas);

// GET /api/filas/:ticketId - Obtener una fila específica
router.get('/filas/:ticketId', getFilaById);

// POST /api/filas - Crear nueva fila (desde el generador)
router.post('/filas', createFila);


// PUT /api/filas/:ticketId - Actualizar una fila existente
router.put('/filas/:ticketId', updateFila);

// POST /api/filas/batch - Crear múltiples filas en lote
router.post('/filas/batch', createFilasBatch);

// PATCH /api/filas/:ticketId/complete - Marcar fila como completada
router.patch('/filas/:ticketId/complete', completeFila);

// DELETE /api/filas/:ticketId - Eliminar una fila
router.delete('/filas/:ticketId', deleteFila);

// GET /api/stats - Estadísticas del sistema
router.get('/stats', getSystemStats);

// GET /api/health - Health check
router.get('/health', healthCheck);

export default router;