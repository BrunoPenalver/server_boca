import { sequelize } from '../database/connection';
import { DataTypes } from 'sequelize';

// Modelo simple basado en RowData del index.ts viejo
const Fila = sequelize.define('Fila', {
  ticketId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  cookies: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usersInQueue: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  usersInLineAheadOfYou: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastUpdated: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  progress: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  eventStartTimeFormatted: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRedirected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastUpdate: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: () => Date.now(),
  },
}, {
  timestamps: true,
  tableName: 'filas',
});

export default Fila;