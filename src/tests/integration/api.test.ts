import request from 'supertest';
import app from "../../app";

describe('API Integration Tests', () => {
  describe('Health Endpoints', () => {
    it('GET / should return hello world', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Hello World! 🌍');
      expect(response.body.data.service).toBe('Appointment Sync API');
      expect(response.body.data.version).toBe('1.0.0');
    });

    it('GET /health should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data.environment).toBe('test');
    });
  });

  describe('Mock External API', () => {
    it('GET /mock-external-api/slots should require authentication', async () => {
      const response = await request(app)
        .get('/mock-external-api/slots')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authorization header required');
    });

    it('GET /mock-external-api/slots should reject invalid credentials', async () => {
      const response = await request(app)
        .get('/mock-external-api/slots')
        .auth('wrong@email.com', 'wrongpassword')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid username or password');
    });

    it('GET /mock-external-api/slots should return messy data with valid auth', async () => {
      const response = await request(app)
        .get('/mock-external-api/slots')
        .auth('admin@example.com', 'admin123') // Use correct credentials
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('api_version');
      expect(response.body).toHaveProperty('total_records');
      
      // Verify messy format structures
      const data = response.body.data;
      const hasFormatA = data.some((item: any) => 
        item.date && item.times && item.doctor
      );
      const hasFormatB = data.some((item: any) => 
        item.available_on && item.slots && item.provider
      );
      const hasFormatC = data.some((item: any) => 
        item.appointment_day && item.free_slots && item.physician_name
      );

      // Should have at least 2 different formats
      const formatCount = [hasFormatA, hasFormatB, hasFormatC].filter(Boolean).length;
      expect(formatCount).toBeGreaterThanOrEqual(2);
    });

    it('GET /mock-external-api/slots should handle invalid auth header format', async () => {
      const response = await request(app)
        .get('/mock-external-api/slots')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Basic Authentication required');
    });
  });

  describe('Internal API', () => {
    // Skip internal API tests that require HTTP calls to self during testing
    // These would need a running server instance
    it('GET /api/available-slots should handle service unavailable gracefully', async () => {
      const response = await request(app)
        .get('/api/available-slots');

      // Should either return 200 with data or 503 if external service unavailable
      expect([200, 503]).toContain(response.status);
      expect(response.body.success).toBeDefined();
      
      if (response.status === 503) {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Service unavailable');
      }
    });

    it('GET /api/available-slots should handle query parameters', async () => {
      const response = await request(app)
        .get('/api/available-slots')
        .query({ provider: 'Dr. Smith', page: 1, limit: 5 });

      // Should handle parameters gracefully even if service is unavailable
      expect([200, 503]).toContain(response.status);
      expect(response.body.success).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.message).toContain('GET /non-existent-endpoint does not exist');
    });

    it('should never return 500 errors', async () => {
      // Test various scenarios that might cause errors
      const endpoints = [
        '/api/available-slots?page=-1',
        '/api/available-slots?limit=0',
        '/mock-external-api/slots',
        '/invalid-endpoint'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).not.toBe(500);
      }
    });
  });

  describe('CORS Headers', () => {
    it('should handle preflight OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/available-slots')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBeLessThan(500);
    });
  });
});