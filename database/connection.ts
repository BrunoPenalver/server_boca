import { Sequelize } from 'sequelize';

const databasePath = process.env.DATABASE_PATH || './database/fila_boca.sqlite';
const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: process.env.DATABASE_LOGGING === 'true' ? console.log : false,
  
  // Configuraciones de SQLite optimizadas
  dialectOptions: {
    // Configuraciones de SQLite para mejor rendimiento
  },
  
  // Pool de conexiones (aunque SQLite no las use realmente)
  pool: {
    max: 1, // SQLite solo permite una conexión de escritura
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  
  // Configuraciones adicionales
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
  
  // Configurar para producción
  ...(isProduction && {
    logging: false,
  }),
});

// Función para inicializar la base de datos
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🗄️ Conectando a la base de datos...');
    
    // Probar la conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida correctamente');
    
    // Sincronizar modelos
    await sequelize.sync({ 
      force: false, // No borrar datos existentes
      alter: process.env.NODE_ENV === 'development' // Solo alterar en desarrollo
    });
    console.log('✅ Modelos sincronizados con la base de datos');
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función para cerrar la base de datos
export async function closeDatabase(): Promise<void> {
  try {
    await sequelize.close();
    console.log('✅ Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('❌ Error cerrando la base de datos:', error);
  }
}