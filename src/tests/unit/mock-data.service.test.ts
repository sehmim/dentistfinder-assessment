import mockDataService from '../../services/mock-data.service';

describe('MockDataService', () => {
  describe('generateMessyResponse', () => {
    it('should generate response with multiple formats', () => {
      const result = mockDataService.generateMessyResponse();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate different format types', () => {
      const result = mockDataService.generateMessyResponse();
      
      // Check if we have different format structures
      const formatTypes = result.map(item => {
        if ('date' in item && 'times' in item && 'doctor' in item) return 'A';
        if ('available_on' in item && 'slots' in item && 'provider' in item) return 'B';
        if ('appointment_day' in item && 'free_slots' in item && 'physician_name' in item) return 'C';
        return 'unknown';
      });

      // Should have at least 2 different format types
      const uniqueFormats = new Set(formatTypes);
      expect(uniqueFormats.size).toBeGreaterThanOrEqual(2);
    });

    it('should generate Format A with correct structure', () => {
      const result = mockDataService.generateMessyResponse();
      
      const formatA = result.find(item => 
        'date' in item && 'times' in item && 'doctor' in item
      );

      if (formatA) {
        expect(formatA).toHaveProperty('date');
        expect(formatA).toHaveProperty('times');
        expect(formatA).toHaveProperty('doctor');
        expect(formatA).toHaveProperty('type');
        expect(Array.isArray((formatA as any).times)).toBe(true);
        expect(typeof (formatA as any).doctor).toBe('object');
        expect((formatA as any).doctor).toHaveProperty('name');
        expect((formatA as any).doctor).toHaveProperty('id');
      }
    });

    it('should generate Format B with correct structure', () => {
      const result = mockDataService.generateMessyResponse();
      
      const formatB = result.find(item => 
        'available_on' in item && 'slots' in item && 'provider' in item
      );

      if (formatB) {
        expect(formatB).toHaveProperty('available_on');
        expect(formatB).toHaveProperty('slots');
        expect(formatB).toHaveProperty('provider');
        expect(formatB).toHaveProperty('category');
        expect(Array.isArray((formatB as any).slots)).toBe(true);
        
        // Check slot structure
        const slots = (formatB as any).slots;
        if (slots.length > 0) {
          expect(slots[0]).toHaveProperty('start');
          expect(slots[0]).toHaveProperty('end');
        }
      }
    });

    it('should generate Format C with correct structure', () => {
      const result = mockDataService.generateMessyResponse();
      
      const formatC = result.find(item => 
        'appointment_day' in item && 'free_slots' in item && 'physician_name' in item
      );

      if (formatC) {
        expect(formatC).toHaveProperty('appointment_day');
        expect(formatC).toHaveProperty('free_slots');
        expect(formatC).toHaveProperty('physician_name');
        expect(formatC).toHaveProperty('physician_code');
        expect(formatC).toHaveProperty('service_type');
        expect(formatC).toHaveProperty('duration_minutes');
        expect(Array.isArray((formatC as any).free_slots)).toBe(true);
        expect(typeof (formatC as any).duration_minutes).toBe('number');
      }
    });

    it('should have consistent data patterns', () => {
      const result = mockDataService.generateMessyResponse();
      
      result.forEach(item => {
        // All items should have some form of date field
        const hasDate = 'date' in item || 'available_on' in item || 'appointment_day' in item;
        expect(hasDate).toBe(true);

        // All items should have some form of time slots
        const hasTimeSlots = 'times' in item || 'slots' in item || 'free_slots' in item;
        expect(hasTimeSlots).toBe(true);

        // All items should have some form of provider info
        const hasProvider = 'doctor' in item || 'provider' in item || 'physician_name' in item;
        expect(hasProvider).toBe(true);
      });
    });

    it('should generate valid date formats', () => {
      const result = mockDataService.generateMessyResponse();
      
      result.forEach(item => {
        if ('date' in item) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          expect((item as any).date).toMatch(dateRegex);
        }
        
        if ('available_on' in item) {
          const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
          expect((item as any).available_on).toMatch(dateRegex);
        }
        
        if ('appointment_day' in item) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          expect((item as any).appointment_day).toMatch(dateRegex);
        }
      });
    });

    it('should generate valid time formats', () => {
      const result = mockDataService.generateMessyResponse();
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      result.forEach(item => {
        if ('times' in item) {
          const times = (item as any).times;
          times.forEach((time: string) => {
            expect(time).toMatch(timeRegex);
          });
        }
        
        if ('slots' in item) {
          const slots = (item as any).slots;
          slots.forEach((slot: any) => {
            expect(slot.start).toMatch(timeRegex);
            expect(slot.end).toMatch(timeRegex);
          });
        }
        
        if ('free_slots' in item) {
          const freeSlots = (item as any).free_slots;
          freeSlots.forEach((time: string) => {
            expect(time).toMatch(timeRegex);
          });
        }
      });
    });

    it('should generate data with realistic provider names', () => {
      const result = mockDataService.generateMessyResponse();
      
      result.forEach(item => {
        let providerName = '';
        
        if ('doctor' in item) {
          providerName = (item as any).doctor.name;
        } else if ('provider' in item) {
          providerName = (item as any).provider;
        } else if ('physician_name' in item) {
          providerName = (item as any).physician_name;
        }
        
        expect(providerName).toContain('Dr.');
        expect(providerName.length).toBeGreaterThan(3);
      });
    });

    it('should generate consistent appointment types', () => {
      const result = mockDataService.generateMessyResponse();
      const validTypes = ['NewPatient', 'General', 'Cleaning', 'Emergency', 'Consultation'];
      
      result.forEach(item => {
        let appointmentType = '';
        
        if ('type' in item) {
          appointmentType = (item as any).type;
        } else if ('category' in item) {
          appointmentType = (item as any).category;
        } else if ('service_type' in item) {
          appointmentType = (item as any).service_type;
        }
        
        expect(validTypes).toContain(appointmentType);
      });
    });

    it('should generate end times after start times in Format B', () => {
      const result = mockDataService.generateMessyResponse();
      
      const formatB = result.find(item => 
        'available_on' in item && 'slots' in item
      );

      if (formatB) {
        const slots = (formatB as any).slots;
        slots.forEach((slot: any) => {
          const startTime = slot.start;
          const endTime = slot.end;
          
          // Convert times to minutes for comparison
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);
          
          expect(endMinutes).toBeGreaterThan(startMinutes);
        });
      }
    });

    it('should maintain data consistency across multiple calls', () => {
      // Generate response multiple times to check consistency
      const results = [
        mockDataService.generateMessyResponse(),
        mockDataService.generateMessyResponse(),
        mockDataService.generateMessyResponse()
      ];

      results.forEach(result => {
        expect(result.length).toBeGreaterThan(0);
        expect(Array.isArray(result)).toBe(true);
        
        // Each result should have the same structure patterns
        const hasMultipleFormats = result.some(item => 'date' in item) &&
                                  result.some(item => 'available_on' in item || 'appointment_day' in item);
        expect(hasMultipleFormats).toBe(true);
      });
    });
  });

// Helper function for time comparison
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

});