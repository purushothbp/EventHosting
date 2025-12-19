import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

type CertificatePayload = {
  participantName: string;
  eventTitle: string;
  eventDate?: Date | string | null;
  organizationName?: string;
  location?: string;
};

export async function generateCertificatePdf(payload: CertificatePayload) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor('#fdf8ee');
  doc.rect(0, 0, width, height, 'F');

  doc.setDrawColor('#c084fc');
  doc.setLineWidth(4);
  doc.rect(24, 24, width - 48, height - 48);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor('#27272a');
  doc.text(payload.organizationName ?? 'Grook', width / 2, 90, { align: 'center' });

  doc.setFontSize(40);
  doc.setTextColor('#7c3aed');
  doc.text('Certificate of Participation', width / 2, 140, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#1c1917');
  doc.text('This is to certify that', width / 2, 200, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(payload.participantName, width / 2, 240, { align: 'center' });

  const formattedDate = payload.eventDate
    ? format(new Date(payload.eventDate), 'MMMM dd, yyyy')
    : null;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#44403c');
  const lines = [
    `has successfully participated in ${payload.eventTitle}${formattedDate ? ` held on ${formattedDate}` : ''}.`,
    payload.location ? `Venue: ${payload.location}` : '',
    'We appreciate your enthusiastic participation and wish you continued success.',
  ].filter(Boolean);

  doc.text(lines, width / 2, 280, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Event Coordinator', width * 0.3, height - 80, { align: 'center' });
  doc.text('Organizer', width * 0.7, height - 80, { align: 'center' });

  const buffer = doc.output('arraybuffer');
  return Buffer.from(buffer);
}
