// Basado en el RowData del index.ts viejo de tabla
export interface RowData {
  ticketId: string;
  cookies: string;
  queueNumber: number | null;
  usersInQueue: number;
  usersInLineAheadOfYou: number | null;
  lastUpdated: string;
  progress: number;
  eventStartTimeFormatted: string;
  link: string;
  isRedirected: boolean;
  estado: string | null;
  lastUpdate: number;
}

// Alias para compatibilidad
export type FilaData = RowData;

export interface ReadinessAnalysis {
  isReady: boolean;
  confidence: number;
  reasons: string[];
  triggeredBy: string;
}

export interface SocketClient {
  id: string;
  type: 'generator' | 'auto-completer' | 'dashboard';
  connectedAt: Date;
  lastActivity: Date;
}

export interface FilaStats {
  total: number;
  active: number;
  completed: number;
  ready: number;
  paused: number;
  error: number;
  averageProgress: number;
  oldestActive: Date | null;
  newestActive: Date | null;
}

export interface SystemStats {
  connectedClients: Record<string, number>;
  totalFilas: number;
  activeVerifications: number;
  lastVerificationRun: Date | null;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

export interface WebSocketEvents {
  // Eventos del generador
  'fila:created': FilaData;
  
  // Eventos del verificador  
  'fila:updated': FilaData;
  'fila:ready': FilaData & { readiness: ReadinessAnalysis };
  
  // Eventos del auto-completer
  'fila:completed': { ticketId: string; status: string; completedAt: string };
  'fila:error': { ticketId: string; error: string };
  
  // Eventos del dashboard
  'dashboard:refresh': FilaData[];
  'dashboard:stats': SystemStats;
  
  // Eventos de cliente
  'client:identify': { type: SocketClient['type'] };
  'client:ping': { timestamp: number };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}