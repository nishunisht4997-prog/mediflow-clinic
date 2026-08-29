/**
 * Generates an NPCI-compliant UPI Intent Link and QR Image URL
 * Standard Format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
 */

export interface UpiPaymentDetails {
  vpa: string; // e.g. "dravishekclinic@hdfcbank"
  name: string; // e.g. "Dr. Avishek's Healthcare & Polyclinic"
  amount: number;
  transactionNote?: string;
  invoiceNumber?: string;
}

export function generateUpiUri({
  vpa,
  name,
  amount,
  transactionNote = 'OPD Consultation Fee',
  invoiceNumber,
}: UpiPaymentDetails): string {
  const note = invoiceNumber ? `Bill-${invoiceNumber}` : transactionNote;
  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(note);

  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}`;
}

export function getQrCodeImageUrl(upiUri: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    upiUri
  )}&margin=10`;
}
