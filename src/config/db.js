const mongoose = require('mongoose');
const logger = require('../utils/logger'); // Adjust path as needed

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('MongoDB Connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      environment: process.env.NODE_ENV
    });

  } catch (err) {
    logger.error('MongoDB Connection Failed', {
      error: {
        message: err.message,
        stack: err.stack
      },
      connectionURI: process.env.MONGO_URI ? 
        process.env.MONGO_URI.replace(/\/\/.*@/, '//*****:*****@') : null
    });
    
    process.exit(1);
  }
};

// Optional: Add MongoDB event listeners
mongoose.connection.on('connecting', () => {
  logger.debug('Connecting to MongoDB...');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB Disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB Reconnected');
});

module.exports = connectDB;