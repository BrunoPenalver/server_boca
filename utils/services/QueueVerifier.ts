import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import pMap from 'p-map';
import Fila from '../models/Fila';
import { broadcast } from '../websockets/SocketManager';

// Configuración igual que el index.ts viejo
const FILA_API = "https://bocajuniors.queue-it.net/spa-api/queue/bocajuniors/";
const PROXY = "http://mr9358u93R:MjzZvLtEEC@ultra.marsproxies.com:44443";
const FILA_ID = 'e20251109';

const PAYLOAD_QUEUE_IT = {
  "targetUrl": "https://bocasocios-gw.bocajuniors.com.ar/queueit/redirect",
  "customUrlParams": "",
  "layoutVersion": 177989870944,
  "layoutName": "Boca Socios",
  "isClientRedayToRedirect": null,
  "isBeforeOrIdle": true
};

const CONCURRENCY = 100;
const TIMEOUT = 10_000;

let isRunning = false;

// Verificar una fila (basado en verifyTask del index.ts viejo)
const verifyFila = async (fila: any) => {
  try {
    const payload = JSON.stringify(PAYLOAD_QUEUE_IT);
    const URL = `${FILA_API}${FILA_ID}/${fila.ticketId}/status`;
    const proxyAgent = new HttpsProxyAgent(PROXY);
    
    const start = Date.now();
    
    const { data, status } = await axios.post(URL, payload, {
      headers: {
        'content-type': 'application/json',
        'Cookie': fila.cookies
      },
      httpsAgent: proxyAgent
    });

    const end = Date.now();
    const elapsed = end - start;
    
    console.log(`${fila.ticketId} - ${status} - ${elapsed}ms`);

    const { ticket } = data;

    // Actualizar en base de datos
    await Fila.update({
      ...ticket,
      lastUpdate: Date.now()
    }, {
      where: { ticketId: fila.ticketId }
    });

    // Enviar por WebSocket
    broadcast('fila_updated', {
      ...ticket,
      ticketId: fila.ticketId,
      cookies: fila.cookies,
      link: fila.link,
    });

  } catch (error) {
    console.error(`Error verificando ${fila.ticketId}:`, error);
  }
};

// Actualizar todas las filas (basado en updateRowStatesAndSort del index.ts viejo)
const updateFilas = async () => {
  const filas = await Fila.findAll({
    order: [['lastUpdate', 'ASC']]
  });

  let validos = 0;
  let error = 0;

  await pMap(filas, async (fila: any) => {
    try {
      // Timeout manual simple
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
      );
      
      await Promise.race([verifyFila(fila), timeoutPromise]);
      validos++;
    } catch (err: any) {
      console.warn(`⚠️ Fila ${fila.ticketId} falló:`, err.message || err);
      error++;
    }
  }, { concurrency: CONCURRENCY, stopOnError: false });

  return { validos, error };
};

// Iniciar el verificador
export const startVerifier = async () => {
  if (isRunning) {
    console.log('⚠️ Verificador ya está corriendo');
    return;
  }

  isRunning = true;
  console.log('🚀 Iniciando verificador de filas...');

  while (isRunning) {
    try {
      console.time("Verificación de filas");
      const { validos, error } = await updateFilas();
      console.timeEnd("Verificación de filas");
      console.log(`✅ ${validos} filas actualizadas correctamente, ❌ ${error} filas con error`);
      
      // Esperar 5 segundos como en el index.ts viejo
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
      console.error('Error en verificación:', err);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10s on error
    }
  }
};

// Detener el verificador
export const stopVerifier = () => {
  isRunning = false;
  console.log('🛑 Verificador detenido');
};

export default { startVerifier, stopVerifier };