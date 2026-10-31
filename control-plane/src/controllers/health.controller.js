import mongoose from 'mongoose';

const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

export const getHealth = (_req, res) => {
  res.json({ status: 'ok', service: 'control-plane', uptimeSeconds: Math.round(process.uptime()) });
};

export const getReady = (_req, res) => {
  const state = mongoose.connection.readyState;
  const ready = state === 1;
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'unavailable',
    database: DB_STATES[state] ?? 'unknown',
  });
};
