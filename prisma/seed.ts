import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MediFlow multi-tenant database...');

  // Clean existing records
  await prisma.notificationLog.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.clinicTask.deleteMany();
  await prisma.staffAttendance.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.prescriptionTemplate.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patientDocument.deleteMany();
  await prisma.patientVital.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.clinic.deleteMany();

  // 1. Create Main Clinic: Dr. Avishek's Clinic & Care Centre
  const clinic1 = await prisma.clinic.create({
    data: {
      name: "Dr. Avishek's Healthcare & Polyclinic",
      slug: "dr-avishek-clinic",
      tagline: "Advanced Diagnostics, Urology & General Health Care",
      phone: "+91 98765 43210",
      email: "contact@dravishekclinic.in",
      address: "Plot 104, Saheed Nagar, Janpath Road",
      city: "Bhubaneswar",
      state: "Odisha",
      currency: "INR",
      currencySymbol: "₹",
      consultationFee: 800,
      whatsappEnabled: true,
      smsEnabled: true,
      subscriptionTier: "CLINIC_PRO",
    },
  });

  // Create Branch 1 & Branch 2
  const branchMain = await prisma.branch.create({
    data: {
      clinicId: clinic1.id,
      name: "Saheed Nagar Main Branch",
      address: "Plot 104, Saheed Nagar, Janpath Road, Bhubaneswar",
      phone: "+91 98765 43210",
      isMainBranch: true,
    },
  });

  const branchCuttack = await prisma.branch.create({
    data: {
      clinicId: clinic1.id,
      name: "Cuttack CDA Sector 9 Branch",
      address: "Plot 24, CDA Sector 9, Cuttack",
      phone: "+91 98765 43211",
      isMainBranch: false,
    },
  });

  // 2. Create Users & Staff
  const docUser = await prisma.user.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      name: "Dr. Avishek Mohapatra",
      email: "doctor@dravishekclinic.in",
      phone: "+91 98765 43210",
      role: "DOCTOR",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const doctor1 = await prisma.doctor.create({
    data: {
      clinicId: clinic1.id,
      userId: docUser.id,
      specialization: "Senior Physician & Consultant Urologist",
      qualifications: "MBBS, MD (General Medicine), DNB (Urology)",
      regNumber: "MCI/OD/2014/09842",
      experienceYears: 12,
      consultationFee: 800,
      bio: "Specializing in adult internal medicine, kidney stone management, prostate health, and diabetic care.",
      availableDays: "Mon,Tue,Wed,Thu,Fri,Sat",
      startTime: "09:00",
      endTime: "19:00",
      slotDuration: 15,
    },
  });

  const recepUser = await prisma.user.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      name: "Priya Sharma",
      email: "reception@dravishekclinic.in",
      phone: "+91 91234 56780",
      role: "RECEPTIONIST",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  const nurseUser = await prisma.user.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      name: "Snigdha Ray",
      email: "nurse@dravishekclinic.in",
      phone: "+91 91234 56781",
      role: "NURSE",
      avatar: "https://images.unsplash.com/photo-1594824813689-ee6b96e95963?w=150&auto=format&fit=crop&q=80",
    },
  });

  const accountUser = await prisma.user.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      name: "Rajesh Behera",
      email: "accounts@dravishekclinic.in",
      phone: "+91 91234 56782",
      role: "ACCOUNTANT",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Smart Prescription Templates
  const templates = [
    {
      title: "Acute Viral Fever & Flu",
      specialty: "General Medicine",
      diagnosis: "Acute Viral Upper Respiratory Infection with Pyrexia",
      symptoms: "High grade fever (102°F) with chills, body ache, sore throat for 3 days",
      advice: "Adequate hydration (3L fluids/day), complete bed rest for 3 days, warm saline gargle 3 times daily. Sponge with lukewarm water if temp > 101°F.",
      investigationsAdvised: "Complete Blood Count (CBC), Dengue NS1 Antigen (if fever persists > 4 days)",
      followUpDays: 4,
      medicines: [
        { medicineName: "Tab. Paracetamol (Dolo 650)", dosage: "650 mg", form: "Tablet", frequency: "1-1-1", timing: "After Food", durationDays: 3, instructions: "SOS for fever above 100°F, min 6 hr gap" },
        { medicineName: "Tab. Levocetirizine + Montelukast (Monticope)", dosage: "5mg/10mg", form: "Tablet", frequency: "0-0-1", timing: "Bedtime", durationDays: 5, instructions: "For cold and congestion" },
        { medicineName: "Tab. Pantoprazole (Pantocid 40)", dosage: "40 mg", form: "Tablet", frequency: "1-0-0", timing: "Before Food", durationDays: 5, instructions: "Take 30 mins before breakfast" },
        { medicineName: "Syrup Ascoril-LS", dosage: "10 ml", form: "Syrup", frequency: "1-0-1", timing: "After Food", durationDays: 5, instructions: "With warm water" }
      ]
    },
    {
      title: "Hypertension Stage 1 (Initial Protocol)",
      specialty: "Cardiology / Internal Medicine",
      diagnosis: "Essential Primary Hypertension Stage 1 (BP 150/94 mmHg)",
      symptoms: "Occasional morning occipital headache, mild dizziness",
      advice: "Strict low salt diet (< 5g/day), 30 mins brisk walking 5 days/week, avoid tobacco and excess caffeine. Maintain daily home BP log.",
      investigationsAdvised: "Lipid Profile, Serum Creatinine, Serum Electrolytes, ECG (12 lead), Urine Microalbumin",
      followUpDays: 14,
      medicines: [
        { medicineName: "Tab. Telmisartan (Telma 40)", dosage: "40 mg", form: "Tablet", frequency: "1-0-0", timing: "After Food", durationDays: 30, instructions: "Take at the same time every morning" },
        { medicineName: "Tab. Amlodipine (Amlong 5)", dosage: "5 mg", form: "Tablet", frequency: "0-0-1", timing: "Bedtime", durationDays: 30, instructions: "If BP remains > 140/90 after 1 week" }
      ]
    },
    {
      title: "Type 2 Diabetes Mellitus Protocol",
      specialty: "Diabetology",
      diagnosis: "Type 2 Diabetes Mellitus with Mild Neuropathy",
      symptoms: "Polyuria, polydipsia, fatigue, occasional burning sensation in feet",
      advice: "Diabetic diet with low glycemic index. Zero refined sugar. 45 mins exercise. Foot care and wear soft footwear.",
      investigationsAdvised: "HbA1c, Fasting Blood Sugar (FBS), Postprandial Blood Sugar (PPBS), Kidney Function Test (KFT)",
      followUpDays: 30,
      medicines: [
        { medicineName: "Tab. Metformin SR (Glycomet SR 500)", dosage: "500 mg", form: "Tablet", frequency: "1-0-1", timing: "With Food", durationDays: 30, instructions: "Take with meals to avoid GI upset" },
        { medicineName: "Tab. Teneligliptin (Ziten 20)", dosage: "20 mg", form: "Tablet", frequency: "1-0-0", timing: "Before Food", durationDays: 30, instructions: "Once daily morning" },
        { medicineName: "Cap. Methylcobalamin + Alpha Lipoic Acid", dosage: "1500 mcg", form: "Capsule", frequency: "0-0-1", timing: "After Food", durationDays: 30, instructions: "For neuropathic tingling" }
      ]
    },
    {
      title: "Acute Gastritis & GERD",
      specialty: "Gastroenterology",
      diagnosis: "Acute Erosive Gastritis with Gastroesophageal Reflux",
      symptoms: "Epigastric burning pain, retrosternal acidity, regurgitation",
      advice: "Avoid spicy, oily and deep-fried food. Do not lie down immediately after eating. Elevate head of bed.",
      investigationsAdvised: "Upper GI Endoscopy (if symptoms persist > 2 weeks)",
      followUpDays: 10,
      medicines: [
        { medicineName: "Tab. Rabeprazole + Domperidone (Razo-D)", dosage: "20mg/30mg", form: "Capsule", frequency: "1-0-0", timing: "Before Food", durationDays: 14, instructions: "Empty stomach 45 mins before breakfast" },
        { medicineName: "Syrup Mucaine Gel", dosage: "10 ml", form: "Syrup", frequency: "1-1-1", timing: "After Food", durationDays: 7, instructions: "Do not drink water for 15 mins after taking" }
      ]
    },
    {
      title: "Urinary Tract Infection (UTI) & Kidney Care",
      specialty: "Urology",
      diagnosis: "Uncomplicated Acute Lower Urinary Tract Infection (Cystitis)",
      symptoms: "Dysuria, increased urinary frequency, lower abdominal discomfort",
      advice: "Drink plenty of water (min 3.5 to 4 Litres/day). Maintain local hygiene.",
      investigationsAdvised: "Urine Routine & Microscopic, Urine Culture & Sensitivity",
      followUpDays: 7,
      medicines: [
        { medicineName: "Tab. Nitrofurantoin (Niftran 100)", dosage: "100 mg", form: "Tablet", frequency: "1-0-1", timing: "After Food", durationDays: 7, instructions: "Complete full 7-day course" },
        { medicineName: "Syrup Citralka (Disodium Hydrogen Citrate)", dosage: "15 ml", form: "Syrup", frequency: "1-1-1", timing: "After Food", durationDays: 5, instructions: "Mix in 1 glass of water" }
      ]
    }
  ];

  for (const t of templates) {
    await prisma.prescriptionTemplate.create({
      data: {
        clinicId: clinic1.id,
        doctorId: doctor1.id,
        title: t.title,
        specialty: t.specialty,
        diagnosis: t.diagnosis,
        symptoms: t.symptoms,
        medicinesJson: JSON.stringify(t.medicines),
        advice: t.advice,
        investigationsAdvised: t.investigationsAdvised,
        followUpDays: t.followUpDays,
      },
    });
  }

  // 4. Create Realistic Patients
  const patientsData = [
    {
      uhid: "MF-2026-0001",
      name: "Rahul Das",
      dob: "1994-06-14",
      age: 32,
      gender: "Male",
      phone: "+91 98610 11223",
      email: "rahul.das@gmail.com",
      bloodGroup: "B+",
      address: "Flat 302, Royal Residency, Nayapalli, Bhubaneswar",
      emergencyContact: "+91 98610 99887 (Father)",
      allergies: "Penicillin (Causes urticaria)",
      medicalHistory: "Essential Hypertension diagnosed in 2023, Mild GERD",
      surgeriesHistory: "None",
      currentMedications: "Telmisartan 40mg once daily",
    },
    {
      uhid: "MF-2026-0002",
      name: "Priya Sharma",
      dob: "1998-03-22",
      age: 28,
      gender: "Female",
      phone: "+91 97780 44556",
      email: "priya.sharma@outlook.com",
      bloodGroup: "O+",
      address: "House 12, Forest Park, Bhubaneswar",
      emergencyContact: "+91 97780 11223 (Spouse)",
      allergies: "Sulfa drugs",
      medicalHistory: "Acute Gastritis, Recurrent Migraine",
      surgeriesHistory: "Appendectomy (2020)",
      currentMedications: "Pantoprazole 40mg SOS",
    },
    {
      uhid: "MF-2026-0003",
      name: "Amit Kumar Jena",
      dob: "1981-11-05",
      age: 45,
      gender: "Male",
      phone: "+91 94370 77889",
      email: "amit.jena@tcs.com",
      bloodGroup: "A+",
      address: "Plot 88, Infocity Road, Patia, Bhubaneswar",
      emergencyContact: "+91 94370 00112 (Brother)",
      allergies: "None known",
      medicalHistory: "Type 2 Diabetes Mellitus (HbA1c 8.2), Bilateral renal calculi (4mm)",
      surgeriesHistory: "None",
      currentMedications: "Metformin 500mg BD, Teneligliptin 20mg OD",
    },
    {
      uhid: "MF-2026-0004",
      name: "Sunita Mohanty",
      dob: "1972-08-19",
      age: 54,
      gender: "Female",
      phone: "+91 98530 66554",
      email: "sunita.mohanty@gmail.com",
      bloodGroup: "AB+",
      address: "Lane 4, Khandagiri Enclave, Bhubaneswar",
      emergencyContact: "+91 98530 11111 (Son)",
      allergies: "Aspirin",
      medicalHistory: "Osteoarthritis of both knees, Hypothyroidism",
      surgeriesHistory: "Cholecystectomy (2019)",
      currentMedications: "Thyronorm 50mcg daily",
    },
    {
      uhid: "MF-2026-0005",
      name: "Rajesh Patnaik",
      dob: "1965-02-10",
      age: 61,
      gender: "Male",
      phone: "+91 94390 33221",
      email: "rajesh.patnaik@bsnl.in",
      bloodGroup: "O-",
      address: "Quarter C-4, AG Colony, Unit 4, Bhubaneswar",
      emergencyContact: "+91 94390 99999 (Wife)",
      allergies: "None",
      medicalHistory: "Coronary Artery Disease (Post PTCA 2022), Hypertension, Dyslipidemia",
      surgeriesHistory: "Angioplasty Stenting (LAD - 2022)",
      currentMedications: "Ecosprin-AV 75/20, Metoprolol 25mg, Telma-H",
    },
    {
      uhid: "MF-2026-0006",
      name: "Ananya Tripathy",
      dob: "2002-09-12",
      age: 24,
      gender: "Female",
      phone: "+91 99370 12345",
      email: "ananya.tripathy@kiit.ac.in",
      bloodGroup: "B+",
      address: "KIIT University Campus, Patia, Bhubaneswar",
      emergencyContact: "+91 99370 88888 (Parent)",
      allergies: "Dust / Pollen",
      medicalHistory: "Allergic Rhinitis, Dysmenorrhea",
      surgeriesHistory: "None",
      currentMedications: "None",
    }
  ];

  const createdPatients: any[] = [];
  for (const p of patientsData) {
    const pat = await prisma.patient.create({
      data: {
        clinicId: clinic1.id,
        ...p,
      },
    });
    createdPatients.push(pat);

    // Add Vitals
    await prisma.patientVital.create({
      data: {
        patientId: pat.id,
        bpSystolic: 128 + Math.floor(Math.random() * 20),
        bpDiastolic: 82 + Math.floor(Math.random() * 10),
        pulse: 74 + Math.floor(Math.random() * 12),
        temperature: 98.4 + (Math.random() * 1.2),
        spo2: 98 + Math.floor(Math.random() * 2),
        weight: 60 + Math.floor(Math.random() * 25),
        height: 165 + Math.floor(Math.random() * 15),
        bmi: 23.5,
        recordedBy: "Nurse Snigdha",
      },
    });

    // Add Sample Document
    await prisma.patientDocument.create({
      data: {
        patientId: pat.id,
        title: "Complete Blood Count & Lipid Profile",
        category: "Lab Report",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: "1.4 MB",
        uploadedBy: "Priya Sharma (Reception)",
      },
    });
  }

  // 5. Today's Appointments & Queue
  const todayStr = new Date().toISOString().split('T')[0];

  const appt1 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[0].id, // Rahul Das
      tokenNumber: 1,
      date: todayStr,
      timeSlot: "09:30 AM",
      type: "Consultation",
      status: "COMPLETED",
      source: "RECEPTION",
      chiefComplaint: "Routine Hypertension review & BP monitoring",
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[1].id, // Priya Sharma
      tokenNumber: 2,
      date: todayStr,
      timeSlot: "10:00 AM",
      type: "Follow-up",
      status: "COMPLETED",
      source: "ONLINE_PORTAL",
      chiefComplaint: "Stomach burning reduced, checking repeat prescription",
    },
  });

  const appt3 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[2].id, // Amit Kumar
      tokenNumber: 3,
      date: todayStr,
      timeSlot: "10:30 AM",
      type: "New Patient",
      status: "IN_CONSULTATION",
      source: "RECEPTION",
      chiefComplaint: "High fasting blood sugar (190 mg/dL) & bilateral flank pain",
    },
  });

  const appt4 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[3].id, // Sunita Mohanty
      tokenNumber: 4,
      date: todayStr,
      timeSlot: "11:00 AM",
      type: "Consultation",
      status: "WAITING",
      source: "WALKIN",
      chiefComplaint: "Severe knee pain and stiffness in the morning",
    },
  });

  const appt5 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[4].id, // Rajesh Patnaik
      tokenNumber: 5,
      date: todayStr,
      timeSlot: "11:30 AM",
      type: "Follow-up",
      status: "WAITING",
      source: "RECEPTION",
      chiefComplaint: "Post-angioplasty 6-month cardiac checkup",
    },
  });

  const appt6 = await prisma.appointment.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      doctorId: doctor1.id,
      patientId: createdPatients[5].id, // Ananya Tripathy
      tokenNumber: 6,
      date: todayStr,
      timeSlot: "12:00 PM",
      type: "Consultation",
      status: "BOOKED",
      source: "ONLINE_PORTAL",
      chiefComplaint: "Persistent dry cough, fever for 2 days",
    },
  });

  // 6. Prescriptions for Completed Appointments
  const rx1 = await prisma.prescription.create({
    data: {
      clinicId: clinic1.id,
      appointmentId: appt1.id,
      patientId: createdPatients[0].id,
      doctorId: doctor1.id,
      symptoms: "Stable BP (130/84 mmHg). No chest pain or breathlessness.",
      diagnosis: "Well-controlled Essential Hypertension",
      advice: "Continue low sodium diet. 30 mins brisk walking. Regular hydration.",
      investigationsAdvised: "Serum Electrolytes & Lipid Profile in 3 months",
      nextFollowUpDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      pdfGenerated: true,
      whatsappSent: true,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx1.id,
        medicineName: "Tab. Telmisartan (Telma 40)",
        dosage: "40 mg",
        form: "Tablet",
        frequency: "1-0-0",
        timing: "After Food",
        durationDays: 30,
        instructions: "Take early morning after breakfast",
      },
      {
        prescriptionId: rx1.id,
        medicineName: "Tab. Rosuvastatin (Rosuvas 10)",
        dosage: "10 mg",
        form: "Tablet",
        frequency: "0-0-1",
        timing: "Bedtime",
        durationDays: 30,
        instructions: "Take before sleep",
      }
    ]
  });

  // 7. Invoices & Billing
  // Invoice 1: Paid Rahul Das
  const inv1 = await prisma.invoice.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      patientId: createdPatients[0].id,
      appointmentId: appt1.id,
      invoiceNumber: "INV-2026-0181",
      subtotal: 1350,
      discount: 100,
      tax: 0,
      totalAmount: 1250,
      paidAmount: 1250,
      paymentStatus: "PAID",
      notes: "Routine consultation + ECG",
    },
  });

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv1.id, description: "Doctor Consultation Fee", unitPrice: 800, quantity: 1, total: 800 },
      { invoiceId: inv1.id, description: "12-Lead Diagnostic ECG", unitPrice: 450, quantity: 1, total: 450 },
      { invoiceId: inv1.id, description: "Blood Sugar (Random Glucometer)", unitPrice: 100, quantity: 1, total: 100 },
    ]
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      amount: 1250,
      method: "UPI",
      transactionRef: "UPI/260827110942/HDFC",
      recordedBy: "Priya Sharma",
    },
  });

  // Invoice 2: Partially Paid / Pending (Amit Kumar)
  const inv2 = await prisma.invoice.create({
    data: {
      clinicId: clinic1.id,
      branchId: branchMain.id,
      patientId: createdPatients[2].id,
      appointmentId: appt3.id,
      invoiceNumber: "INV-2026-0182",
      subtotal: 3750,
      discount: 0,
      tax: 0,
      totalAmount: 3750,
      paidAmount: 2000,
      paymentStatus: "PARTIAL",
      notes: "Urology Consultation + Ultrasound KUB + Urine Analysis",
    },
  });

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: inv2.id, description: "Super-Specialist Consultation", unitPrice: 800, quantity: 1, total: 800 },
      { invoiceId: inv2.id, description: "Ultrasound KUB (Kidney, Ureter, Bladder)", unitPrice: 2500, quantity: 1, total: 2500 },
      { invoiceId: inv2.id, description: "Urine Routine & Microscopic Test", unitPrice: 450, quantity: 1, total: 450 },
    ]
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv2.id,
      amount: 2000,
      method: "CASH",
      transactionRef: "CASH_DRAWER_01",
      recordedBy: "Priya Sharma",
    },
  });

  // 8. Staff Attendance for Today
  await prisma.staffAttendance.createMany({
    data: [
      { clinicId: clinic1.id, userId: docUser.id, date: todayStr, checkIn: "08:50 AM", status: "PRESENT", remarks: "On time for morning rounds" },
      { clinicId: clinic1.id, userId: recepUser.id, date: todayStr, checkIn: "08:55 AM", status: "PRESENT", remarks: "Opened front desk reception" },
      { clinicId: clinic1.id, userId: nurseUser.id, date: todayStr, checkIn: "09:15 AM", status: "LATE", remarks: "Traffic delay at Rasulgarh square" },
      { clinicId: clinic1.id, userId: accountUser.id, date: todayStr, checkIn: "09:00 AM", status: "PRESENT", remarks: "Reconciling daily accounts" },
    ]
  });

  // 9. Clinic Task Management
  await prisma.clinicTask.createMany({
    data: [
      {
        clinicId: clinic1.id,
        title: "Call patient Rahul Das for 30-day BP follow-up",
        description: "Verify if BP log was maintained and medicines were purchased.",
        assignedTo: recepUser.id,
        createdBy: docUser.id,
        patientId: createdPatients[0].id,
        priority: "HIGH",
        dueDate: "Today 4:00 PM",
        status: "PENDING",
      },
      {
        clinicId: clinic1.id,
        title: "Collect pending ₹1,750 payment from Amit Kumar",
        description: "Balance for Ultrasound KUB diagnostic procedure.",
        assignedTo: recepUser.id,
        createdBy: accountUser.id,
        patientId: createdPatients[2].id,
        priority: "HIGH",
        dueDate: "Today 5:30 PM",
        status: "IN_PROGRESS",
      },
      {
        clinicId: clinic1.id,
        title: "Upload MRI Spine report for Sunita Mohanty",
        description: "Scan received from Capital Diagnostic Centre.",
        assignedTo: nurseUser.id,
        createdBy: docUser.id,
        patientId: createdPatients[3].id,
        priority: "MEDIUM",
        dueDate: "Today 2:00 PM",
        status: "COMPLETED",
      },
      {
        clinicId: clinic1.id,
        title: "Confirm tomorrow's 18 scheduled appointments via WhatsApp",
        description: "Send automated interactive confirmation template to all patients.",
        assignedTo: recepUser.id,
        createdBy: docUser.id,
        priority: "URGENT",
        dueDate: "Today 6:00 PM",
        status: "PENDING",
      },
      {
        clinicId: clinic1.id,
        title: "Follow up with post-surgery kidney stone patient Rajesh Patnaik",
        description: "Check for any fever, hematuria or stent discomfort.",
        assignedTo: nurseUser.id,
        createdBy: docUser.id,
        patientId: createdPatients[4].id,
        priority: "HIGH",
        dueDate: "Today 3:30 PM",
        status: "IN_PROGRESS",
      }
    ]
  });

  // 10. Patient Follow-up CRM Pipeline
  await prisma.followUp.createMany({
    data: [
      {
        clinicId: clinic1.id,
        patientId: createdPatients[0].id,
        doctorId: doctor1.id,
        prescriptionId: rx1.id,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        stage: "SCHEDULED",
        notes: "Repeat BP checkup & prescription refill",
      },
      {
        clinicId: clinic1.id,
        patientId: createdPatients[1].id,
        doctorId: doctor1.id,
        dueDate: todayStr,
        stage: "REMINDER_SENT",
        notes: "Automated WhatsApp reminder sent at 08:30 AM",
        lastContactedAt: new Date(),
      },
      {
        clinicId: clinic1.id,
        patientId: createdPatients[2].id,
        doctorId: doctor1.id,
        dueDate: todayStr,
        stage: "CALLED",
        notes: "Patient reached clinic, currently in waiting room",
        lastContactedAt: new Date(),
      },
      {
        clinicId: clinic1.id,
        patientId: createdPatients[3].id,
        doctorId: doctor1.id,
        dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        stage: "RE_BOOKED",
        notes: "Patient rescheduled knee review to next Tuesday",
        lastContactedAt: new Date(),
      }
    ]
  });

  // 11. Notification Logs (WhatsApp / SMS)
  await prisma.notificationLog.createMany({
    data: [
      {
        clinicId: clinic1.id,
        recipientName: "Rahul Das",
        recipientPhone: "+91 98610 11223",
        channel: "WHATSAPP",
        type: "APPOINTMENT_CONFIRMED",
        content: "Hello Rahul, your appointment with Dr. Avishek Mohapatra is confirmed for 09:30 AM today. Token #1. Clinic: Saheed Nagar Main Branch.",
        status: "DELIVERED",
      },
      {
        clinicId: clinic1.id,
        recipientName: "Rahul Das",
        recipientPhone: "+91 98610 11223",
        channel: "WHATSAPP",
        type: "PRESCRIPTION",
        content: "Dear Rahul, your digital prescription from Dr. Avishek Mohapatra is ready. Download PDF: https://mediflow.in/rx/MF-2026-0001",
        status: "DELIVERED",
      },
      {
        clinicId: clinic1.id,
        recipientName: "Priya Sharma",
        recipientPhone: "+91 97780 44556",
        channel: "WHATSAPP",
        type: "REMINDER",
        content: "Reminder: Your follow-up appointment with Dr. Avishek is scheduled today at 10:00 AM. Token #2.",
        status: "DELIVERED",
      }
    ]
  });

  console.log('✅ Seed completed successfully! Multi-tenant data loaded for Dr. Avishek Clinic.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
