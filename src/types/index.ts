export type UserRole = 'DOCTOR' | 'RECEPTIONIST' | 'NURSE' | 'ACCOUNTANT' | 'ADMIN' | 'LAB_TECH';

export interface CurrentUserContext {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  clinicId: string;
  clinicName: string;
  clinicSlug: string;
  branchName: string;
}

export interface PatientSummary {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  surgeriesHistory?: string | null;
  currentMedications?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  createdAt: string;
  vitals?: any[];
  documents?: any[];
  appointments?: any[];
  prescriptions?: any[];
  invoices?: any[];
  followUps?: any[];
}

export interface PrescriptionMedicineItem {
  medicineName: string;
  dosage: string;
  form: string;
  frequency: string;
  timing: string;
  durationDays: number;
  instructions?: string;
}

export interface PrescriptionFormData {
  patientId: string;
  appointmentId?: string;
  symptoms: string;
  diagnosis: string;
  medicines: PrescriptionMedicineItem[];
  advice: string;
  investigationsAdvised: string;
  nextFollowUpDays: number;
}
