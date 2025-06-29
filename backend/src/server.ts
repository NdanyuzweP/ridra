import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'express-async-errors';

import connectDB from './config/database';
import { specs, swaggerUi } from './config/swagger';
import { createAdminUser } from './utils/createAdmin';
import { startLocationScheduler, startLocationHistoryCleanup } from './utils/locationScheduler';
import { seedDatabase } from './utils/seedData';

// Import routes
import authRoutes from './routes/auth';
import busRoutes from './routes/buses';
import routeRoutes from './routes/routes';
import pickupPointRoutes from './routes/pickupPoints';
import busScheduleRoutes from './routes/busSchedules';
import userInterestRoutes from './routes/userInterests';
import userRoutes from './routes/users';
import busLocationRoutes from './routes/busLocations';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
});

// CORS configuration for mobile app
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8081', // Expo development server
      'http://localhost:19006', // Expo web
      'http://localhost:3000', // React web
      'exp://192.168.1.100:8081', // Expo on physical device (adjust IP)
      'exp://localhost:8081', // Expo localhost
    ];
    
    // Add any additional origins from environment variable
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable for development
}));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/pickup-points', pickupPointRoutes);
app.use('/api/bus-schedules', busScheduleRoutes);
app.use('/api/user-interests', userInterestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bus-locations', busLocationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Ridra Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ridra Bus Tracking API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Seed database endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/seed', async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: 'Database seeded successfully' });
    } catch (error) {
      console.error('Seeding error:', error);
      res.status(500).json({ error: 'Failed to seed database' });
    }
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create admin user if not exists
    await createAdminUser();
    
    // Check if we need to seed the database
    const Bus = (await import('./models/Bus')).default;
    const busCount = await Bus.countDocuments();
    
    if (busCount === 0) {
      console.log('No buses found in database, seeding with sample data...');
      await seedDatabase();
    }
    
    // Start background schedulers
    startLocationScheduler();
    startLocationHistoryCleanup();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📱 CORS enabled for mobile development`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`🌱 Seed endpoint: POST http://localhost:${PORT}/api/seed`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;