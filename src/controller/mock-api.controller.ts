import { Request, Response } from 'express';
import mockDataService from '../services/mock-data.service';
import { APIResponse } from '../types';

class MockApiController {
  private readonly validCredentials = {
    username: 'admin@example.com',
    password: 'admin123'
  };

  // Mock External API endpoint - requires Basic Auth
  async getSlots(req: Request, res: Response): Promise<void> {
    try {
      // Check for Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authorization header required'
        } as APIResponse);
        return;
      }

      // Check if it's Basic Auth
      if (!authHeader.startsWith('Basic ')) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Basic Authentication required'
        } as APIResponse);
        return;
      }

      // Decode Basic Auth credentials
      const base64Credentials = authHeader.substring(6); // Remove 'Basic '
      let credentials: string;
      
      try {
        credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      } catch (error) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Invalid Authorization header format'
        } as APIResponse);
        return;
      }

      const [username, password] = credentials.split(':');

      // Validate credentials exist
      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Username and password required in Basic Auth'
        } as APIResponse);
        return;
      }

      // Validate credentials match
      if (username !== this.validCredentials.username || password !== this.validCredentials.password) {
        console.warn(`[MOCK-API] Invalid login attempt: ${username}`);
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid username or password'
        } as APIResponse);
        return;
      }

      console.log(`[MOCK-API] Authenticated request from: ${username}`);

      // Generate messy, inconsistent response using the service
      const messyResponse = mockDataService.generateMessyResponse();

      res.status(200).json({
        success: true,
        data: messyResponse,
        message: 'Mock external API response',
        // Add some realistic API metadata
        api_version: '2.1',
        timestamp: new Date().toISOString(),
        total_records: messyResponse.length
      } as APIResponse);

    } catch (error: any) {
      console.error(`[MOCK-API] Error: ${error.message}`);
      
      // General service errors
      res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Mock external API temporarily unavailable'
      } as APIResponse);
    }
  }
}

export default new MockApiController();