import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import { User } from '@/models';

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

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
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

    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      organization: creatorOrgId,
      emailVerified: true,
    });

    await newUser.save();

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
