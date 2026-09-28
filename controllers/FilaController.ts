import { Request, Response } from 'express';
import Fila from '../models/Fila';

// Helper para respuestas API
const createResponse = (success: boolean, data?: any, error?: string) => ({
  success,
  data,
  error,
  timestamp: new Date().toISOString(),
});

// GET /api/filas - Obtener todas las filas
export const getAllFilas = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;
    
    const status = req.query.status as string;
    const isReady = req.query.isReady as string;
    const orderBy = req.query.orderBy as string || 'createdAt';
    const orderDirection = req.query.orderDirection as string || 'DESC';

    // Construir filtros WHERE
    const where: any = {};
    if (status) where.estado = status;
    if (isReady !== undefined) where.isRedirected = isReady === 'true';

    // Obtener filas con paginación
    const { rows: filas, count: total } = await Fila.findAndCountAll({
      where,
      limit,
      offset,
      order: [[orderBy, orderDirection.toUpperCase()]],
    });

    const response = {
      success: true,
      data: filas,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error obteniendo filas:', error);
    res.status(500).json(createResponse(false, undefined, 'Error interno del servidor'));
  }
};

// GET /api/filas/active - Obtener filas activas (basado en la lógica del index.ts viejo)
export const getActiveFilas = async (req: Request, res: Response) => {
  try {
    const filas = await Fila.findAll({
      order: [
        ['isRedirected', 'ASC'],  // Redirected first (como en el index.ts viejo)
        ['progress', 'DESC'],     // Luego por progreso
        ['lastUpdate', 'ASC']     // Luego por última actualización
      ]
    });
    res.json(createResponse(true, filas));
  } catch (error) {
    console.error('Error obteniendo filas activas:', error);
    res.status(500).json(createResponse(false, undefined, 'Error obteniendo filas activas'));
  }
};

// GET /api/filas/:ticketId - Obtener fila específica
export const getFilaById = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    const fila = await Fila.findOne({
      where: { ticketId },
    });

    if (!fila) {
      return res.status(404).json(createResponse(false, undefined, 'Fila no encontrada'));
    }

    res.json(createResponse(true, fila));
  } catch (error) {
    console.error('Error obteniendo fila:', error);
    res.status(500).json(createResponse(false, undefined, 'Error interno del servidor'));
  }
};

// POST /api/filas - Crear nueva fila
export const createFila = async (req: Request, res: Response) => {
  try {
    const filaData = req.body;

    // Validar datos requeridos (basado en RowData)
    if (!filaData.ticketId || !filaData.cookies || !filaData.link) {
      return res.status(400).json(createResponse(false, undefined, 'Datos requeridos: ticketId, cookies, link'));
    }

    // Verificar si ya existe
    const existingFila = await Fila.findOne({
      where: { ticketId: filaData.ticketId },
    });

    if (existingFila) {
      return res.status(409).json(createResponse(false, undefined, 'Fila ya existe'));
    }

    // Crear nueva fila con estructura RowData
    const nuevaFila = await Fila.create({
      ticketId: filaData.ticketId,
      cookies: filaData.cookies,
      link: filaData.link,
      queueNumber: filaData.queueNumber || null,
      usersInQueue: filaData.usersInQueue || 0,
      usersInLineAheadOfYou: filaData.usersInLineAheadOfYou || null,
      lastUpdated: filaData.lastUpdated || new Date().toISOString(),
      progress: filaData.progress || 0,
      eventStartTimeFormatted: filaData.eventStartTimeFormatted || null,
      isRedirected: filaData.isRedirected || false,
      estado: filaData.estado || null,
      lastUpdate: Date.now(),
    });

    console.log(`✅ Nueva fila creada: ${filaData.ticketId.substring(0, 8)}...`);

    res.status(201).json(createResponse(true, nuevaFila));
  } catch (error: any) {
    console.error('Error creando fila:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json(createResponse(false, undefined, 'Fila ya existe'));
    }
    
    res.status(500).json(createResponse(false, undefined, 'Error creando fila'));
  }
};

// PUT /api/filas/:ticketId - Actualizar fila
export const updateFila = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const updateData = req.body;

    const [updatedCount] = await Fila.update(updateData, {
      where: { ticketId }
    });

    if (updatedCount === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Fila no encontrada'));
    }

    const updatedFila = await Fila.findOne({ where: { ticketId } });
    res.json(createResponse(true, updatedFila));
  } catch (error) {
    console.error('Error actualizando fila:', error);
    res.status(500).json(createResponse(false, undefined, 'Error actualizando fila'));
  }
};

// PUT /api/filas/:ticketId/complete - Completar fila (marcar como redirected)
export const completeFila = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const [updatedCount] = await Fila.update({
      isRedirected: true,
      estado: 'completed',
      lastUpdate: Date.now()
    }, {
      where: { ticketId }
    });

    if (updatedCount === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Fila no encontrada'));
    }

    console.log(`🎉 Fila completada: ${ticketId.substring(0, 8)}...`);

    const updatedFila = await Fila.findOne({ where: { ticketId } });
    res.json(createResponse(true, updatedFila));
  } catch (error) {
    console.error('Error completando fila:', error);
    res.status(500).json(createResponse(false, undefined, 'Error completando fila'));
  }
};

// DELETE /api/filas/:ticketId - Eliminar fila
export const deleteFila = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const deleted = await Fila.destroy({
      where: { ticketId },
    });

    if (deleted === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Fila no encontrada'));
    }

    console.log(`🗑️ Fila eliminada: ${ticketId.substring(0, 8)}...`);
    res.json(createResponse(true, { deleted: true }));
  } catch (error) {
    console.error('Error eliminando fila:', error);
    res.status(500).json(createResponse(false, undefined, 'Error eliminando fila'));
  }
};

// POST /api/filas/batch - Crear múltiples filas
export const createFilasBatch = async (req: Request, res: Response) => {
  try {
    const filasData = req.body;

    if (!Array.isArray(filasData) || filasData.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Array de filas requerido'));
    }

    // Validar todas las filas
    for (const filaData of filasData) {
      if (!filaData.ticketId || !filaData.cookies || !filaData.link) {
        return res.status(400).json(createResponse(false, undefined, 'Datos faltantes en alguna fila'));
      }
    }

    // Crear filas en lote
    const filasCreadas = await Fila.bulkCreate(filasData, {
      ignoreDuplicates: true,
    });

    console.log(`✅ ${filasCreadas.length} filas creadas en lote`);

    res.status(201).json(createResponse(true, {
      created: filasCreadas.length,
      total: filasData.length,
    }));
  } catch (error) {
    console.error('Error en creación en lote:', error);
    res.status(500).json(createResponse(false, undefined, 'Error en creación en lote'));
  }
};