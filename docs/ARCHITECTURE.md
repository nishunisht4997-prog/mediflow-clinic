# MediFlow SaaS — Complete Folder Structure & System Architecture

This document provides the enterprise directory layout, architectural boundaries, and frontend/backend separation for **MediFlow — Clinic Operating System (SaaS)** for Geinca.

---

## 📁 Repository Directory Structure

```
d:\patient-management/
├── prisma/                               # Database Schema, Migrations & Seeds
│   ├── schema.prisma                     # Multi-tenant PostgreSQL / SQLite Database Schema
│   └── seed.ts                           # Comprehensive Seed Data (Doctors, Staff, Rx Templates, Patients)
│
├── src/
│   ├── app/                              # Next.js App Router (Fullstack Pages & API Gateway)
│   │   ├── (auth)/                       # Role-Based Authentication & Session Management
│   │   ├── api/                          # RESTful API Gateway Handlers
│   │   │   ├── appointments/             # GET, POST (Daily OPD Queue, Walk-In tokens)
│   │   │   │   └── [id]/                 # PATCH (Call to Cabin, Complete Consultation)
│   │   │   ├── billing/                  # GET, POST (Invoices, Itemized Services)
│   │   │   │   └── payment/              # POST (UPI/Cash/Card Reconciliation)
│   │   │   ├── clinic/[slug]/            # GET (Public Clinic Profile & Timings API)
│   │   │   ├── dashboard/stats/          # GET (Doctor KPI Counters, Schedule, Analytics)
│   │   │   ├── followups/                # GET, POST, PATCH (Follow-up CRM Funnel)
│   │   │   ├── patients/                 # GET, POST (Patient Directory, Registration)
│   │   │   │   └── [id]/                 # GET, PATCH (360° Profile & Chronological Timeline)
│   │   │   ├── prescriptions/            # GET, POST (Digital Rx, Follow-up Trigger)
│   │   │   │   └── [id]/                 # GET (Letterhead PDF Print data)
│   │   │   ├── staff/                    # GET, POST (Attendance Register & Check-In)
│   │   │   ├── tasks/                    # GET, POST, PATCH, DELETE (Clinic Work Board)
│   │   │   ├── templates/                # GET, POST (Smart Prescription Protocols)
│   │   │   └── whatsapp/send/            # POST, GET (Meta Cloud WhatsApp Gateway)
│   │   │
│   │   ├── clinic/[slug]/                # Public Doctor/Clinic Mini-Website (`dravishek.mediflow.in`)
│   │   │   └── page.tsx                  # Treatments, Bio, Multi-Branch Booking Stepper, Reviews
│   │   ├── portal/                       # Patient Self-Service Health Locker (`/portal`)
│   │   │   └── page.tsx                  # Vitals Graph, Rx Locker, Lab Reports, Bills
│   │   ├── globals.css                   # Medical Styling, Variables, Print Layouts
│   │   ├── layout.tsx                    # Root Layout
│   │   └── page.tsx                      # Master Clinic Operating System Dashboard
│   │
│   ├── components/                       # Modular UI Components (Domain Separation)
│   │   ├── layout/                       # Global Layout Primitives
│   │   │   ├── Navbar.tsx                # Role Switcher, Quick Actions, Global Search
│   │   │   └── Sidebar.tsx               # Navigation Menu with Notification Badges
│   │   ├── dashboard/                    # Doctor Command Center Domain
│   │   │   ├── DoctorDashboard.tsx       # KPI Overview, OPD Queue, Staff Ticker
│   │   │   └── AnalyticsCharts.tsx       # Recharts (Weekly Revenue, Payment Mix, Department)
│   │   ├── patients/                     # 360° Patient CRM Domain
│   │   │   ├── PatientListAndTimeline.tsx# Chronological Care Timeline, Biomarkers, Docs
│   │   │   └── PatientRegistrationModal.tsx # Registration Modal with Vitals & Allergies
│   │   ├── appointments/                 # Appointment & Queue Domain
│   │   │   ├── AppointmentsQueueView.tsx # Live Token Board, Waiting Room Caller
│   │   │   └── AppointmentBookingModal.tsx # Booking Stepper (Existing / Quick Walk-In)
│   │   ├── prescription/                 # Digital Rx & Smart Protocol Domain
│   │   │   ├── DigitalPrescriptionMaker.tsx # Smart Templates, Dosage Chips (1-0-1), Advice
│   │   │   └── PrescriptionPdfPreview.tsx   # Letterhead PDF Print Preview with Doctor Stamp
│   │   ├── billing/                      # Invoicing & Payment Domain
│   │   │   ├── BillingInvoicesView.tsx   # Bills List, Payment Mode Breakdown
│   │   │   ├── BillingModal.tsx          # Itemized Service Bill Generator
│   │   │   └── DynamicUpiQrModal.tsx     # Dynamic Indian UPI QR Code (GPay/PhonePe/Paytm)
│   │   ├── staff/                        # Staff & RBAC Domain
│   │   │   └── StaffAttendanceManager.tsx# Attendance Register & Role Permissions Matrix
│   │   ├── tasks/                        # Clinic Work Board Domain
│   │   │   └── ClinicWorkBoard.tsx       # Kanban Work Board (To-Do, In Progress, Done)
│   │   ├── followup/                     # Patient Retention CRM Domain
│   │   │   └── FollowUpCRM.tsx           # Stage Funnel (Due → WhatsApp → Called → Done)
│   │   ├── whatsapp/                     # WhatsApp Automations Domain
│   │   │   └── WhatsAppHub.tsx           # Dispatcher & Smartphone UI Simulator
│   │   ├── public/                       # Growth & Marketing Mini-Website Domain
│   │   │   └── ClinicWebsitePreview.tsx  # Specialty Treatments, Stepper Booking, Reviews, FAQs
│   │   └── portal/                       # Patient Portal Domain
│   │       ├── PatientPortalView.tsx     # Health Locker, Medicine Schedule
│   │       └── VitalsTrendChart.tsx      # BP Systolic/Diastolic & Pulse Curves
│   │
│   ├── services/                         # Backend Business Logic Services
│   │   ├── dashboard.service.ts          # KPI aggregations & analytics trend calculator
│   │   ├── patient.service.ts            # UHID assignment & chronological timeline compiler
│   │   ├── appointment.service.ts        # Token sequencing & slot availability engine
│   │   ├── prescription.service.ts       # Protocol parser & follow-up scheduler
│   │   ├── billing.service.ts            # Ledger, discounts & payment reconciliation
│   │   └── whatsapp.service.ts           # Meta Cloud API / Gupshup message dispatcher
│   │
│   ├── lib/                              # Core Utility Libraries & Drivers
│   │   ├── prisma.ts                     # Database connection pool singleton
│   │   ├── upi.ts                        # Dynamic NPCI UPI QR Generator
│   │   └── utils.ts                      # Formatters (INR currency, dates, styling merge)
│   │
│   └── types/                            # TypeScript Domain Models & DTOs
│       └── index.ts                      # UserRole, PatientSummary, Prescription types
│
├── docs/                                 # Technical Architecture & Deployment Documentation
│   └── ARCHITECTURE.md                   # System Design & Layering Blueprint
│
├── .env                                  # Environment Configurations
├── package.json                          # Dependencies & NPM Scripts
├── tsconfig.json                         # TypeScript Compiler Configuration
└── README.md                             # Project Documentation
```

---

## 🔒 Separation of Concerns & Clean Architecture

1. **Presentation Layer (`src/components/` & `src/app/`)**:
   - Zero direct database queries in UI components.
   - All state management handled through standardized REST API hooks and typed endpoints.

2. **Service Layer (`src/services/`)**:
   - Pure business logic isolated from HTTP request/response handling.
   - Reusable across API routes, server actions, background workers, and CLI commands.

3. **Data Access Layer (`src/lib/prisma.ts` & `prisma/schema.prisma`)**:
   - Multi-tenant tenant scoping via `clinicId`.
   - Strongly typed Prisma client models with relation graphs.

4. **External Gateways (`src/lib/upi.ts`, `src/services/whatsapp.service.ts`)**:
   - Indian UPI QR engine and WhatsApp Business notification drivers.
