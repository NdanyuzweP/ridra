import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'express-async-errors';

import connectDB from './config/database';
import { specs, swaggerUi } from './config/swagger';
import { createAdminUser } from './utils/createAdmin';
import { seedDatabase } from './utils/seedData';
import { startLocationScheduler, startLocationHistoryCleanup } from './utils/locationScheduler';

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

// Database stats endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/stats', async (req, res) => {
    try {
      const Bus = (await import('./models/Bus')).default;
      const Route = (await import('./models/Route')).default;
      const User = (await import('./models/User')).default;
      const BusSchedule = (await import('./models/BusSchedule')).default;
      const PickupPoint = (await import('./models/PickupPoint')).default;
      const UserInterest = (await import('./models/UserInterest')).default;
      
      const stats = {
        buses: await Bus.countDocuments(),
        routes: await Route.countDocuments(),
        users: await User.countDocuments(),
        schedules: await BusSchedule.countDocuments(),
        pickupPoints: await PickupPoint.countDocuments(),
        userInterests: await UserInterest.countDocuments(),
      };
      
      res.json({ stats });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
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
    
    // Seed database with sample data if empty
    await seedDatabase();
    
    // Check existing data in database
    const Bus = (await import('./models/Bus')).default;
    const Route = (await import('./models/Route')).default;
    const User = (await import('./models/User')).default;
    const UserInterest = (await import('./models/UserInterest')).default;
    
    const busCount = await Bus.countDocuments();
    const routeCount = await Route.countDocuments();
    const userCount = await User.countDocuments();
    const interestCount = await UserInterest.countDocuments();
    
    console.log(`📊 Database Status:`);
    console.log(`   - Buses: ${busCount}`);
    console.log(`   - Routes: ${routeCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - User Interests: ${interestCount}`);
    
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
        console.log(`📊 Stats endpoint: GET http://localhost:${PORT}/api/stats`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;