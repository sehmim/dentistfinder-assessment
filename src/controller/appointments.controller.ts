import { Request, Response } from 'express';
import normalizerService from '../services/normalizer.service';
import { APIResponse, PaginatedResponse, SlotQueryParams, UnifiedSlot, MessyAPIResponse } from '../types';

class AppointmentsController {

  // Public Internal API endpoint - unified format
  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[INTERNAL-API] Public request for available slots`);

      // Extract query parameters
      const { provider, date, page = 1, limit = 10 }: SlotQueryParams = req.query as any;

      // Step 1: Call the mock external API with Basic Auth
      console.log(`[INTERNAL-API] Calling mock external API`);
      const messyData = await this.callMockExternalAPI();

      // Step 2: Normalize the messy data
      console.log(`[INTERNAL-API] Normalizing ${messyData.length} records`);
      const normalizedSlots = normalizerService.normalizeAppointmentData(messyData);

      // Step 3: Apply filters if provided
      let filteredSlots = normalizedSlots;
      
      if (provider) {
        filteredSlots = filteredSlots.filter(slot => 
          slot.provider.toLowerCase().includes(provider.toLowerCase())
        );
        console.log(`[INTERNAL-API] Filtered by provider '${provider}': ${filteredSlots.length} slots`);
      }

      if (date) {
        filteredSlots = filteredSlots.filter(slot => slot.date === date);
        console.log(`[INTERNAL-API] Filtered by date '${date}': ${filteredSlots.length} slots`);
      }

      // Step 4: Apply pagination
      const pageNum = Math.max(1, parseInt(page.toString()));
      const limitNum = Math.max(1, Math.min(50, parseInt(limit.toString()))); // Max 50 per page
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedSlots = filteredSlots.slice(startIndex, endIndex);

      // Step 5: Calculate pagination metadata
      const totalSlots = filteredSlots.length;
      const totalPages = Math.ceil(totalSlots / limitNum);

      console.log(`[INTERNAL-API] Returning page ${pageNum} of ${totalPages} (${paginatedSlots.length} slots)`);

      // Step 6: Return unified response
      const response: PaginatedResponse<UnifiedSlot[]> = {
        success: true,
        data: paginatedSlots,
        message: 'Available appointment slots',
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalSlots,
          pages: totalPages
        }
      };

      res.status(200).json(response);

    } catch (error: any) {
      console.error(`[INTERNAL-API] Error: ${error.message}`);
      
      // Handle different types of errors
      if (error.message.includes('Mock API')) {
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'External API temporarily unavailable'
        } as APIResponse);
      } else {
        res.status(503).json({
          success: false,
          error: 'Service unavailable',
          message: 'Internal API temporarily unavailable'
        } as APIResponse);
      }
    }
  }

  /**
   * Makes HTTP call to the mock external API using Basic Auth
   */
  private async callMockExternalAPI(): Promise<MessyAPIResponse[]> {
    try {
      const email = process.env.MOCK_API_EMAIL || 'admin@example.com';
      const password = process.env.MOCK_API_PASSWORD || 'admin123';
      const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
      
      // Create Basic Auth header
      const credentials = Buffer.from(`${email}:${password}`).toString('base64');
      const authHeader = `Basic ${credentials}`;

      console.log(`[INTERNAL-API] Making authenticated request to mock API`);

      // Make HTTP request to our own mock API endpoint
      const response = await fetch(`${baseUrl}/mock-external-api/slots`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Mock API responded with ${response.status}: ${response.statusText}`);
      }

      const jsonResponse = await response.json() as APIResponse;

      if (!jsonResponse.success) {
        throw new Error(`Mock API error: ${jsonResponse.message}`);
      }

      console.log(`[INTERNAL-API] Successfully fetched ${(jsonResponse.data as MessyAPIResponse[]).length} records from mock API`);
      return jsonResponse.data as MessyAPIResponse[];

    } catch (error: any) {
      console.error(`[INTERNAL-API] Failed to call mock API:`, error.message);
      throw new Error(`Mock API call failed: ${error.message}`);
    }
  }
}

export default new AppointmentsController();