export interface ClinicConfig {
  clinicName: string;
  shortName: string;
  tagline: string;
  doctorName: string;
  doctorShortName: string;
  specialization: string;
  qualifications: string;
  regNumber: string;
  experienceYears: number;
  consultationFee: number;
  phone: string;
  email: string;
  website: string;
  address: string;
  rating: number;
  totalReviews: number;
  doctorPhoto: string;
  aboutDoctor: string;
  branches: {
    name: string;
    city: string;
    address: string;
    phone: string;
    timings: string;
    statusBadge: string;
  }[];
}

/**
 * 🏥 CENTRAL CLINIC & DOCTOR CONFIGURATION
 * -------------------------------------------------------------
 * Future mein kisi bhi Doctor ya Clinic ka naam badalna ho,
 * toh sirf is ek file mein values change karni hain.
 * Poore application (Navbar, Prescription PDF, WhatsApp,
 * Billing Slips, Public Website) par auto-update ho jayega!
 */
export const CLINIC_CONFIG: ClinicConfig = {
  clinicName: "Genica Healthcare & Polyclinic",
  shortName: "Genica Clinic",
  tagline: "Advanced Multi-Specialty & Women's Healthcare",

  // Primary Doctor Profile
  doctorName: "Dr. Priyabarta Aruk",
  doctorShortName: "Dr. Priyabarta",
  specialization: "Consultant Physician & Specialist",
  qualifications: "MBBS, MD (General Medicine), DNB, FMAS",
  regNumber: "MCI/OD/2014/09842",
  experienceYears: 12,
  consultationFee: 800,

  // Contact & Location
  phone: "+91 98765 43210",
  email: "contact@genicaclinic.in",
  website: "genica.mediflow.in",
  address: "Plot 104, Saheed Nagar, Janpath Road, Bhubaneswar, Odisha",

  // Public Profile
  rating: 4.9,
  totalReviews: 420,
  doctorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
  aboutDoctor: "Senior Consultant Specialist with over 12+ years of clinical excellence. Dedicated to comprehensive patient care, diagnostics, and clinical wellness.",

  // Clinic Branches
  branches: [
    {
      name: "Saheed Nagar Main Branch",
      city: "Bhubaneswar",
      address: "Plot 104, Janpath Road, Near Saheed Nagar Tower, Bhubaneswar, Odisha",
      phone: "+91 98765 43210",
      timings: "Mon – Sat: 09:00 AM – 01:00 PM & 05:00 PM – 08:30 PM",
      statusBadge: "Open Today",
    },
    {
      name: "CDA Sector 9 Branch",
      city: "Cuttack",
      address: "Plot 24, Near High Court Road, CDA Sector 9, Cuttack",
      phone: "+91 98765 43211",
      timings: "Tue, Thu, Sun: 03:00 PM – 05:00 PM",
      statusBadge: "Evening OPD",
    },
  ],
};
