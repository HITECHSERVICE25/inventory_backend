const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

// Load environment variables first
dotenv.config();

// Create Express app
const app = express();

// Configure middleware
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/v1/examples', require('./routes/exampleRoutes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/company', require('./routes/companyRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/technicians', require('./routes/technicianRoutes'));
app.use('/api/v1/commissions', require('./routes/commissionRoutes'));
app.use('/api/v1/inventory', require('./routes/allocationRoutes'));
app.use('/api/v1/installation', require('./routes/installationRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/payments', require('./routes/paymentRoutes'));


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {

    // Connect to database
    await connectDB();

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // Handle uncaught errors
    server.on('error', (error) => {
      logger.error('Server error:', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down server...');
      server.close(() => {
        console.log("Server closed.");
        logger.info('Server closed');
        process.exit(0);
      });
    };

    // Handle termination signals
    process.on('SIGINT', () => {
      shutdown();
    });

    process.on('SIGTERM', () => {
      shutdown();
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', {
        error: err.message,
        stack: err.stack
      });
      shutdown();
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', {
        error: err.message,
        stack: err.stack
      });
      shutdown();
    });

  } catch (error) {
    logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};


// Start the application
startServer();