import mongoose from 'mongoose';

export const connectDb = async (uri, logger) => {
  mongoose.set('strictQuery', true);
  mongoose.connection.on('disconnected', () => logger.warn('mongo disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('mongo reconnected'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  logger.info('mongo connected', { db: mongoose.connection.name });
};

export const disconnectDb = () => mongoose.disconnect();
