import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /              - Hello World`);
  console.log(`   GET  /health        - Health Check`);
  console.log(`   GET  /api/available-slots - Public Unified Appointment API`);
  console.log(`   GET  /mock-external-api/slots - Mock PMS API (requires Basic Auth)`);
  console.log(`\n📚 API Documentation:`);
  console.log(`   GET  /api-docs      - Swagger UI Documentation`);
  console.log(`\n🚀 Ready to test!`);
});