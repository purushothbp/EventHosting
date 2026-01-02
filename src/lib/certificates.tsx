import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { format } from 'date-fns';

type CertificatePayload = {
  participantName: string;
  eventTitle: string;
  eventDate?: Date | string | null;
  organizationName?: string;
  organizationLogoDataUrl?: string;
  location?: string;
  certificateId?: string;
  verificationUrl?: string;
  coordinatorName?: string;
  organizerName?: string;
};

const normalizeText = (text: string) =>
  text
    .normalize('NFKD')
    .replace(/^\d+[.)\s-]*/, '')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export async function generateCertificatePdf(payload: CertificatePayload) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  /* ===== GRAND BACKGROUND ===== */
  doc.setFillColor(253, 252, 249);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(6);
  doc.rect(20, 20, W - 40, H - 40);

  doc.setDrawColor(125, 94, 19);
  doc.setLineWidth(1.5);
  doc.rect(32, 32, W - 64, H - 64);

  /* ===== LOGO ===== */
  if (payload.organizationLogoDataUrl) {
    doc.addImage(payload.organizationLogoDataUrl, 'PNG', 60, 60, 90, 80);
  }

  /* ===== HEADER ===== */
  doc.setFont('times', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(88, 28, 135);
  doc.text((payload.organizationName ?? '').toUpperCase(), W / 2, 110, { align: 'center' });

  if (payload.certificateId) {
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Certificate ID: ${payload.certificateId}`, W - 70, 60, { align: 'right' });
  }

  /* ===== TITLE ===== */
  doc.setFontSize(42);
  doc.setTextColor(0, 0, 0);
  doc.text('CERTIFICATE OF PARTICIPATION', W / 2, 185, { align: 'center' });

  /* ===== BODY ===== */
  doc.setFontSize(18);
  doc.text('This is proudly presented to', W / 2, 245, { align: 'center' });

  doc.setFont('courier', 'bolditalic');
  doc.setFontSize(38);
  doc.text(payload.participantName.toUpperCase(), W / 2, 295, { align: 'center' });

  const title = normalizeText(payload.eventTitle);
  const location = payload.location ? normalizeText(payload.location) : '';
  const date = payload.eventDate ? format(new Date(payload.eventDate), 'MMMM dd, yyyy') : '';

  doc.setFont('times', 'normal');
  doc.setFontSize(18);
  doc.text('for outstanding participation in the event titled', W / 2, 345, { align: 'center' });

  doc.setFont('times', 'bolditalic');
  doc.setFontSize(20);
  doc.setTextColor(125, 94, 19);
  doc.text(title, W / 2, 375, { align: 'center', maxWidth: 720 });

  doc.setFont('times', 'normal');
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(`held on ${date} at ${location}`, W / 2, 410, { align: 'center' });

  /* ===== SIGNATURES ===== */
  doc.setFontSize(13);

  doc.text(payload.coordinatorName ?? '', 280, H - 120, { align: 'center' });
  doc.line(180, H - 115, 380, H - 115);
  doc.text('Event Coordinator', 280, H - 100, { align: 'center' });

  doc.text(payload.organizerName ?? '', W - 280, H - 120, { align: 'center' });
  doc.line(W - 380, H - 115, W - 180, H - 115);
  doc.text('Head of Department', W - 280, H - 100, { align: 'center' });

  /* ===== GOLD SEAL ===== */
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(3);
  doc.setFontSize(9);
  doc.circle(W / 2, H - 135, 32);
  doc.text('OFFICIAL', W / 2, H - 142, { align: 'center' });
  doc.text('SEAL', W / 2, H - 125, { align: 'center' });

  /* ===== QR CODE ===== */
  if (payload.verificationUrl) {
    const qr = await QRCode.toDataURL(payload.verificationUrl, { width: 120 });
    doc.addImage(qr, 'PNG', W - 150, H - 190, 90, 90);
    doc.setFontSize(9);
    doc.text('Verify Certificate', W - 105, H - 90, { align: 'center' });
  }

  const output = doc.output('arraybuffer');
  return Buffer.from(new Uint8Array(output as ArrayBuffer));
}
