import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

// Variables simples
let io: Server;
let clients = new Map();

export const initializeSocketManager = (server: HttpServer): void => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Cliente se identifica
    socket.on('identify', (data: any) => {
      clients.set(socket.id, {
        id: socket.id,
        type: data.type || 'unknown',
        connected: new Date()
      });
      console.log(`Cliente ${socket.id} registrado como ${data.type}`);
    });

    // Nueva fila creada
    socket.on('fila_created', (data: any) => {
      console.log(`Nueva fila: ${data.ticketId?.substring(0, 8)}...`);
      // Enviar a todos los clientes
      io.emit('fila_created', data);
    });

    // Fila actualizada
    socket.on('fila_updated', (data: any) => {
      io.emit('fila_updated', data);
    });

    // Fila lista para completar
    socket.on('fila_ready', (data: any) => {
      console.log(`FILA LISTA: ${data.ticketId?.substring(0, 8)}...`);
      io.emit('fila_ready', data);
    });

    // Fila completada
    socket.on('fila_completed', (data: any) => {
      console.log(`Fila completada: ${data.ticketId?.substring(0, 8)}...`);
      io.emit('fila_completed', data);
    });

    // Error en fila
    socket.on('fila_error', (data: any) => {
      console.log(`Error: ${data.ticketId?.substring(0, 8)}... - ${data.error}`);
      io.emit('fila_error', data);
    });

    // Ping/Pong simple
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      clients.delete(socket.id);
    });
  });

  console.log('WebSocket inicializado');
};

// Enviar mensaje a todos
export const broadcast = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};

// Enviar a cliente específico
export const sendToClient = (socketId: string, event: string, data: any): void => {
  if (io) {
    io.to(socketId).emit(event, data);
  }
};

// Obtener clientes conectados
export const getClients = (): any[] => {
  return Array.from(clients.values());
};

// Cerrar WebSocket
export const closeSocket = (): void => {
  if (io) {
    io.close();
    console.log('WebSocket cerrado');
  }
};

export default initializeSocketManager;