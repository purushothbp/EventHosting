import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import { User, Organization } from '@/models';
import { sendOrgInvitationEmail } from '@/lib/email';
import { hash } from 'bcryptjs';

const ROLE_PERMISSIONS: Record<string, Array<'staff' | 'coordinator'>> = {
  'super-admin': ['staff', 'coordinator'],
  'admin': ['staff', 'coordinator'],
  'staff': ['coordinator'],
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role } = await request.json();

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password.trim() : '';

    if (!trimmedName || !normalizedEmail || !rawPassword || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (rawPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (!['staff', 'coordinator'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be staff or coordinator' },
        { status: 400 }
      );
    }

    const creatorRole = (session.user as any).role;
    const creatorOrgId = (session.user as any).organization;
    const permittedRoles = ROLE_PERMISSIONS[creatorRole] ?? [];

    if (!creatorOrgId) {
      return NextResponse.json(
        { error: 'You are not linked to any organization' },
        { status: 400 }
      );
    }

    if (!permittedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'You are not allowed to create this type of account' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const organization = await Organization.findById(creatorOrgId)
      .lean<{ name: string } | null>();
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(rawPassword, 12);

    const newUser = new User({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      organization: creatorOrgId,
      emailVerified: true,
    });

    await newUser.save();

    try {
      await sendOrgInvitationEmail({
        email: newUser.email,
        name: trimmedName,
        temporaryPassword: rawPassword,
        role,
        organizationName: organization.name,
        invitedBy: session.user.name || 'Administrator',
      });
    } catch (inviteError) {
      console.error('Failed to send invitation email:', inviteError);
    }

    return NextResponse.json(
      { success: true, userId: newUser._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
