import { UnifiedSlot, MessyFormatA, MessyFormatB, MessyFormatC, MessyAPIResponse } from '../types';

class NormalizerService {

  /**
   * Normalizes messy API responses into unified format
   * @param messyData Array of different format objects
   * @returns Array of unified slot objects
   */
  normalizeAppointmentData(messyData: MessyAPIResponse[]): UnifiedSlot[] {
    const normalizedSlots: UnifiedSlot[] = [];

    console.log(`[NORMALIZER] Processing ${messyData.length} messy records`);

    messyData.forEach((record, index) => {
      try {
        const slots = this.normalizeRecord(record);
        normalizedSlots.push(...slots);
      } catch (error: any) {
        console.error(`[NORMALIZER] Failed to normalize record ${index}:`, error.message);
        // Continue processing other records even if one fails
      }
    });

    console.log(`[NORMALIZER] Successfully normalized ${normalizedSlots.length} appointment slots`);
    return normalizedSlots;
  }

  /**
   * Normalizes a single record by detecting its format and converting it
   */
  private normalizeRecord(record: MessyAPIResponse): UnifiedSlot[] {
    // Detect format and normalize accordingly
    if (this.isFormatA(record)) {
      return this.normalizeFormatA(record);
    } else if (this.isFormatB(record)) {
      return this.normalizeFormatB(record);
    } else if (this.isFormatC(record)) {
      return this.normalizeFormatC(record);
    } else {
      throw new Error('Unknown format detected');
    }
  }

  /**
   * Format A Detection: has 'date', 'times', 'doctor' fields
   */
  private isFormatA(record: any): record is MessyFormatA {
    return record.date && 
           record.times && 
           Array.isArray(record.times) && 
           record.doctor && 
           record.doctor.name;
  }

  /**
   * Format B Detection: has 'available_on', 'slots', 'provider' fields
   */
  private isFormatB(record: any): record is MessyFormatB {
    return record.available_on && 
           record.slots && 
           Array.isArray(record.slots) && 
           record.provider;
  }

  /**
   * Format C Detection: has 'appointment_day', 'free_slots', 'physician_name' fields
   */
  private isFormatC(record: any): record is MessyFormatC {
    return record.appointment_day && 
           record.free_slots && 
           Array.isArray(record.free_slots) && 
           record.physician_name;
  }

  /**
   * Normalize Format A to unified format
   * Input: { date: "2025-07-20", times: ["09:00", "10:30"], doctor: { name: "Dr. Smith" } }
   * Output: [{ date: "2025-07-20", start_time: "09:00", provider: "Dr. Smith" }, ...]
   */
  private normalizeFormatA(record: MessyFormatA): UnifiedSlot[] {
    const slots: UnifiedSlot[] = [];
    
    record.times.forEach(time => {
      slots.push({
        date: this.normalizeDate(record.date),
        start_time: time,
        provider: record.doctor.name
      });
    });

    return slots;
  }

  /**
   * Normalize Format B to unified format
   * Input: { available_on: "2025/07/21", slots: [{ start: "10:00" }], provider: "Dr. Lee" }
   * Output: [{ date: "2025-07-21", start_time: "10:00", provider: "Dr. Lee" }]
   */
  private normalizeFormatB(record: MessyFormatB): UnifiedSlot[] {
    const slots: UnifiedSlot[] = [];
    
    record.slots.forEach(slot => {
      slots.push({
        date: this.normalizeDate(record.available_on),
        start_time: slot.start,
        provider: record.provider
      });
    });

    return slots;
  }

  /**
   * Normalize Format C to unified format
   * Input: { appointment_day: "2025-07-22", free_slots: ["08:30"], physician_name: "Dr. Johnson" }
   * Output: [{ date: "2025-07-22", start_time: "08:30", provider: "Dr. Johnson" }]
   */
  private normalizeFormatC(record: MessyFormatC): UnifiedSlot[] {
    const slots: UnifiedSlot[] = [];
    
    record.free_slots.forEach(time => {
      slots.push({
        date: this.normalizeDate(record.appointment_day),
        start_time: time,
        provider: record.physician_name
      });
    });

    return slots;
  }

  /**
   * Normalize different date formats to YYYY-MM-DD
   * Handles: "2025-07-20", "2025/07/21", etc.
   */
  private normalizeDate(dateStr: string): string {
    // Convert different date formats to YYYY-MM-DD
    if (dateStr.includes('/')) {
      // Convert "2025/07/21" to "2025-07-21"
      return dateStr.replace(/\//g, '-');
    }
    
    // Already in correct format "2025-07-20"
    return dateStr;
  }

  /**
   * Validates that the normalized data matches expected format
   */
  validateNormalizedData(slots: UnifiedSlot[]): boolean {
    return slots.every(slot => {
      return slot.date && 
             slot.start_time && 
             slot.provider &&
             typeof slot.date === 'string' &&
             typeof slot.start_time === 'string' &&
             typeof slot.provider === 'string';
    });
  }
}

export default new NormalizerService();