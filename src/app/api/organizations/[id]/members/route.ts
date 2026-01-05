import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import { Organization, User } from '@/models';
import { sendOrgInvitationEmail } from '@/lib/email';
import crypto from 'crypto';
import { Types } from 'mongoose';

type Context = {
  params: Promise<{ id: string }>;
};

const allowedRoles = ['staff', 'coordinator', 'admin'] as const;

export async function POST(request: Request, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'name, email, role are required' }, { status: 400 });
    }
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Unsupported role' }, { status: 400 });
    }

    await connectToDatabase();
    const org = await Organization.findById(id)
      .lean<{ _id: Types.ObjectId; name: string }>()
      .exec();
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const sessionRole = (session.user as any).role || 'user';
    const isSuperAdmin = sessionRole === 'super-admin';
    const isOrgAdmin = sessionRole === 'admin' && (session.user as any).organization?.toString() === id;
    if (!isSuperAdmin && !isOrgAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex');
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      organization: org._id,
      role,
      emailVerified: true,
    });

    sendOrgInvitationEmail({
      email: user.email,
      name: user.name,
      temporaryPassword: tempPassword,
      role: role === 'admin' ? 'coordinator' : role, // keep template enum happy
      organizationName: org.name,
      invitedBy: session.user?.name || 'Org Admin',
    }).catch((err) => console.error('Failed to send org invite', err));

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Create org member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
