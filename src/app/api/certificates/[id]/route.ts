import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongo';
import { Certificate } from '@/models';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: Context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Certificate id is required' }, { status: 400 });
    }

    await connectToDatabase();
    const cert = await Certificate.findOne({ certificateId: id }).lean();
    if (!cert) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    return NextResponse.json({
      valid: cert.status === 'valid',
      certificateId: cert.certificateId,
      participantName: cert.participantName,
      participantEmail: cert.participantEmail,
      eventTitle: cert.eventTitle,
      eventDate: cert.eventDate,
      organizationName: cert.organizationName,
      issuedAt: cert.issuedAt,
      status: cert.status,
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    return NextResponse.json({ error: 'Failed to verify certificate' }, { status: 500 });
  }
}
