import fs from 'fs';
import path from 'path';
import { RawAppointment, MessyFormatA, MessyFormatB, MessyFormatC, MessyAPIResponse } from '../types';

class MockDataService {
  private appointments: RawAppointment[] = [];
  private formats = ['A', 'B', 'C'];

  constructor() {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    try {
      const appointmentsPath = path.join(__dirname, '../data/appointments.json');
      console.log(`[MOCK-DATA] Attempting to load appointments from: ${appointmentsPath}`);
      
      if (!fs.existsSync(appointmentsPath)) {
        console.warn(`[MOCK-DATA] Appointments file not found at ${appointmentsPath}`);
        this.appointments = [];
        return;
      }

      const appointmentsData = fs.readFileSync(appointmentsPath, 'utf8');
      const parsed = JSON.parse(appointmentsData);
      this.appointments = parsed.appointments || [];
      console.log(`[MOCK-DATA] Loaded ${this.appointments.length} appointments from file`);
    } catch (error) {
      console.error('[MOCK-DATA] Failed to load appointments:', error);
      this.appointments = [];
    }
  }

  generateMessyResponse(): MessyAPIResponse[] {
    const response: MessyAPIResponse[] = [];

    // If no appointments loaded, generate some fake data
    if (this.appointments.length === 0) {
      console.warn('[MOCK-DATA] No appointments found, generating fake data');
      this.appointments = this.generateFakeAppointments();
    }

    this.appointments.forEach((appointment, index) => {
      // Cycle through the 3 formats
      const formatIndex = index % 3;
      const format = this.formats[formatIndex];

      switch (format) {
        case 'A':
          response.push(this.generateFormatA(appointment));
          break;
        case 'B':
          response.push(this.generateFormatB(appointment));
          break;
        case 'C':
          response.push(this.generateFormatC(appointment));
          break;
      }
    });

    console.log(`[MOCK-DATA] Generated ${response.length} appointment records using 3 messy formats`);
    return response;
  }

  private generateFakeAppointments(): RawAppointment[] {
    return [
      {
        id: "1",
        date: "2025-07-20",
        doctorId: "d1001",
        doctorName: "Dr. Smith",
        slots: ["09:00", "10:30", "13:15", "14:45"],
        appointmentType: "NewPatient"
      },
      {
        id: "2",
        date: "2025-07-21",
        doctorId: "d1002",
        doctorName: "Dr. Lee",
        slots: ["10:00", "11:00", "15:30"],
        appointmentType: "General"
      },
      {
        id: "3",
        date: "2025-07-22",
        doctorId: "d1003",
        doctorName: "Dr. Johnson",
        slots: ["08:30", "09:30", "11:15", "16:00"],
        appointmentType: "Cleaning"
      },
      {
        id: "4",
        date: "2025-07-23",
        doctorId: "d1001",
        doctorName: "Dr. Smith",
        slots: ["09:15", "12:00", "14:30"],
        appointmentType: "Emergency"
      },
      {
        id: "5",
        date: "2025-07-24",
        doctorId: "d1002",
        doctorName: "Dr. Lee",
        slots: ["10:45", "13:30", "15:15"],
        appointmentType: "Consultation"
      }
    ];
  }

  // Format A - Exact format from requirements
  private generateFormatA(appointment: RawAppointment): MessyFormatA {
    return {
      date: appointment.date,
      times: appointment.slots,
      doctor: {
        name: appointment.doctorName,
        id: appointment.doctorId
      },
      type: appointment.appointmentType
    };
  }

  // Format B - Exact format from requirements
  private generateFormatB(appointment: RawAppointment): MessyFormatB {
    return {
      available_on: appointment.date.replace(/-/g, '/'), // Different date format
      slots: appointment.slots.map(time => ({
        start: time,
        end: this.addMinutes(time, 30)
      })),
      provider: appointment.doctorName,
      category: appointment.appointmentType
    };
  }

  // Format C - Third messy format
  private generateFormatC(appointment: RawAppointment): MessyFormatC {
    return {
      appointment_day: appointment.date,
      free_slots: appointment.slots,
      physician_name: appointment.doctorName,
      physician_code: appointment.doctorId,
      service_type: appointment.appointmentType,
      duration_minutes: 30
    };
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }
}

export default new MockDataService();