import normalizerService from '../../services/normalizer.service';
import { MessyFormatA, MessyFormatB, MessyFormatC, MessyAPIResponse } from '../../types';

describe('NormalizerService', () => {
  describe('normalizeAppointmentData', () => {
    it('should normalize Format A correctly', () => {
      const mockFormatA: MessyFormatA = {
        date: '2025-07-20',
        times: ['09:00', '10:30', '13:15'],
        doctor: {
          name: 'Dr. Smith',
          id: 'd1001'
        },
        type: 'NewPatient'
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatA]);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2025-07-20',
        start_time: '09:00',
        provider: 'Dr. Smith'
      });
      expect(result[1]).toEqual({
        date: '2025-07-20',
        start_time: '10:30',
        provider: 'Dr. Smith'
      });
      expect(result[2]).toEqual({
        date: '2025-07-20',
        start_time: '13:15',
        provider: 'Dr. Smith'
      });
    });

    it('should normalize Format B correctly', () => {
      const mockFormatB: MessyFormatB = {
        available_on: '2025/07/21',
        slots: [
          { start: '10:00', end: '10:30' },
          { start: '11:00', end: '11:30' }
        ],
        provider: 'Dr. Lee',
        category: 'General'
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatB]);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        date: '2025-07-21',
        start_time: '10:00',
        provider: 'Dr. Lee'
      });
      expect(result[1]).toEqual({
        date: '2025-07-21',
        start_time: '11:00',
        provider: 'Dr. Lee'
      });
    });

    it('should normalize Format C correctly', () => {
      const mockFormatC: MessyFormatC = {
        appointment_day: '2025-07-22',
        free_slots: ['08:30', '09:30', '11:15'],
        physician_name: 'Dr. Johnson',
        physician_code: 'd1003',
        service_type: 'Cleaning',
        duration_minutes: 30
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatC]);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2025-07-22',
        start_time: '08:30',
        provider: 'Dr. Johnson'
      });
      expect(result[1]).toEqual({
        date: '2025-07-22',
        start_time: '09:30',
        provider: 'Dr. Johnson'
      });
      expect(result[2]).toEqual({
        date: '2025-07-22',
        start_time: '11:15',
        provider: 'Dr. Johnson'
      });
    });

    it('should handle mixed formats in single request', () => {
      const mixedData: MessyAPIResponse[] = [
        {
          date: '2025-07-20',
          times: ['09:00'],
          doctor: { name: 'Dr. Smith', id: 'd1001' },
          type: 'NewPatient'
        },
        {
          available_on: '2025/07/21',
          slots: [{ start: '10:00', end: '10:30' }],
          provider: 'Dr. Lee',
          category: 'General'
        },
        {
          appointment_day: '2025-07-22',
          free_slots: ['08:30'],
          physician_name: 'Dr. Johnson',
          physician_code: 'd1003',
          service_type: 'Cleaning',
          duration_minutes: 30
        }
      ];

      const result = normalizerService.normalizeAppointmentData(mixedData);

      expect(result).toHaveLength(3);
      expect(result[0].provider).toBe('Dr. Smith');
      expect(result[1].provider).toBe('Dr. Lee');
      expect(result[2].provider).toBe('Dr. Johnson');
      
      // All should have consistent format
      result.forEach(slot => {
        expect(slot).toHaveProperty('date');
        expect(slot).toHaveProperty('start_time');
        expect(slot).toHaveProperty('provider');
      });
    });

    it('should handle empty array', () => {
      const result = normalizerService.normalizeAppointmentData([]);
      expect(result).toEqual([]);
    });

    it('should continue processing when individual records fail', () => {
      const mixedData = [
        {
          date: '2025-07-20',
          times: ['09:00'],
          doctor: { name: 'Dr. Smith', id: 'd1001' },
          type: 'NewPatient'
        },
        // Invalid record - missing required fields
        {
          invalid: 'data'
        },
        {
          available_on: '2025/07/21',
          slots: [{ start: '10:00', end: '10:30' }],
          provider: 'Dr. Lee',
          category: 'General'
        }
      ] as any;

      const result = normalizerService.normalizeAppointmentData(mixedData);

      // Should process valid records and skip invalid ones
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('Dr. Smith');
      expect(result[1].provider).toBe('Dr. Lee');
    });

    it('should normalize different date formats correctly', () => {
      const formatB: MessyFormatB = {
        available_on: '2025/12/31', // Different date format
        slots: [{ start: '10:00', end: '10:30' }],
        provider: 'Dr. Test',
        category: 'General'
      };

      const result = normalizerService.normalizeAppointmentData([formatB]);

      expect(result[0].date).toBe('2025-12-31'); // Should be normalized to YYYY-MM-DD
    });

    it('should handle Format A with empty times array', () => {
      const mockFormatA: MessyFormatA = {
        date: '2025-07-20',
        times: [], // Empty times
        doctor: { name: 'Dr. Smith', id: 'd1001' },
        type: 'NewPatient'
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatA]);
      expect(result).toEqual([]);
    });

    it('should handle Format B with empty slots array', () => {
      const mockFormatB: MessyFormatB = {
        available_on: '2025/07/21',
        slots: [], // Empty slots
        provider: 'Dr. Lee',
        category: 'General'
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatB]);
      expect(result).toEqual([]);
    });

    it('should handle Format C with empty free_slots array', () => {
      const mockFormatC: MessyFormatC = {
        appointment_day: '2025-07-22',
        free_slots: [], // Empty free_slots
        physician_name: 'Dr. Johnson',
        physician_code: 'd1003',
        service_type: 'Cleaning',
        duration_minutes: 30
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatC]);
      expect(result).toEqual([]);
    });

    it('should preserve time format correctly', () => {
      const testTimes = ['09:00', '10:30', '13:15', '16:45'];
      const mockFormatA: MessyFormatA = {
        date: '2025-07-20',
        times: testTimes,
        doctor: { name: 'Dr. Test', id: 'd999' },
        type: 'TestType'
      };

      const result = normalizerService.normalizeAppointmentData([mockFormatA]);

      expect(result).toHaveLength(testTimes.length);
      result.forEach((slot, index) => {
        expect(slot.start_time).toBe(testTimes[index]);
        expect(slot.start_time).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
      });
    });

    it('should handle edge case date formats', () => {
      const edgeCases = [
        { available_on: '2025/01/01', expected: '2025-01-01' },
        { available_on: '2025/12/31', expected: '2025-12-31' },
        { available_on: '2025/02/29', expected: '2025-02-29' } // Leap year consideration
      ];

      edgeCases.forEach(({ available_on, expected }) => {
        const mockFormatB: MessyFormatB = {
          available_on,
          slots: [{ start: '10:00', end: '10:30' }],
          provider: 'Dr. Test',
          category: 'General'
        };

        const result = normalizerService.normalizeAppointmentData([mockFormatB]);
        expect(result[0].date).toBe(expected);
      });
    });

    it('should maintain referential integrity for same provider', () => {
      const mockData: MessyAPIResponse[] = [
        {
          date: '2025-07-20',
          times: ['09:00', '10:00'],
          doctor: { name: 'Dr. Consistent', id: 'd100' },
          type: 'Type1'
        },
        {
          appointment_day: '2025-07-21',
          free_slots: ['11:00', '12:00'],
          physician_name: 'Dr. Consistent',
          physician_code: 'd100',
          service_type: 'Type2',
          duration_minutes: 30
        }
      ];

      const result = normalizerService.normalizeAppointmentData(mockData);

      // All slots for the same provider should have consistent naming
      const providerSlots = result.filter(slot => slot.provider === 'Dr. Consistent');
      expect(providerSlots).toHaveLength(4);
      
      providerSlots.forEach(slot => {
        expect(slot.provider).toBe('Dr. Consistent');
      });
    });
  });

  describe('validateNormalizedData', () => {
    it('should validate correct unified slot data', () => {
      const validData = [
        {
          date: '2025-07-20',
          start_time: '09:00',
          provider: 'Dr. Smith'
        },
        {
          date: '2025-07-21',
          start_time: '10:30',
          provider: 'Dr. Lee'
        }
      ];

      const result = normalizerService.validateNormalizedData(validData);
      expect(result).toBe(true);
    });

    it('should reject invalid unified slot data - missing date', () => {
      const invalidData = [
        {
          start_time: '09:00',
          provider: 'Dr. Smith'
          // Missing date
        }
      ] as any;

      const result = normalizerService.validateNormalizedData(invalidData);
      expect(result).toBe(false);
    });

    it('should reject invalid unified slot data - missing start_time', () => {
      const invalidData = [
        {
          date: '2025-07-20',
          provider: 'Dr. Smith'
          // Missing start_time
        }
      ] as any;

      const result = normalizerService.validateNormalizedData(invalidData);
      expect(result).toBe(false);
    });

    it('should reject invalid unified slot data - missing provider', () => {
      const invalidData = [
        {
          date: '2025-07-20',
          start_time: '09:00'
          // Missing provider
        }
      ] as any;

      const result = normalizerService.validateNormalizedData(invalidData);
      expect(result).toBe(false);
    });

    it('should reject data with wrong data types', () => {
      const invalidData = [
        {
          date: 123, // Should be string
          start_time: '09:00',
          provider: 'Dr. Smith'
        }
      ] as any;

      const result = normalizerService.validateNormalizedData(invalidData);
      expect(result).toBe(false);
    });

    it('should validate empty array', () => {
      const result = normalizerService.validateNormalizedData([]);
      expect(result).toBe(true);
    });
  });
});