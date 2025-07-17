import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { APIResponse } from './types';
import appointmentsController from './controller/appointments.controller';
import mockApiController from './controller/mock-api.controller';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

const app = express();

// CORS Configuration - Only allow specific frontends
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log rejected origins for security monitoring
    console.warn(`🚫 CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS policy'), false);
  },
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight for 24 hours
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Hello World route
app.get('/', (req: Request, res: Response) => {
  const response: APIResponse = {
    success: true,
    data: {
      message: 'Hello World! 🌍',
      service: 'Appointment Sync API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  };
  res.json(response);
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  const response: APIResponse = {
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  };
  res.json(response);
});

// Mock External API (simulates 3rd party PMS with Basic Auth)
app.get('/mock-external-api/slots', (req, res) => mockApiController.getSlots(req, res));

// Internal API (public unified format)
app.get('/api/available-slots', (req, res) => appointmentsController.getAvailableSlots(req, res));

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Appointment Sync API Docs'
}));

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.baseUrl} does not exist`
  });
});

// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${error.message}`);
  
  // Never return 500 - always classify the error
  res.status(400).json({
    success: false,
    error: 'Bad Request',
    message: error.message || 'Something went wrong'
  });
});

export default app;