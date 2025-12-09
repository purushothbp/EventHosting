import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/app/lib/mongo';
import { User } from '@/models';

const sanitizeProfile = (user: any) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  year: user.year,
  phone: user.phone,
  location: user.location,
  website: user.website,
  bio: user.bio,
  image: user.avatarUrl,
  education: user.education || [],
  experience: user.experience || [],
  skills: user.skills || [],
  projects: user.projects || [],
  socialProfiles: user.socialProfiles || [],
  certifications: user.certifications || [],
});

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params?.id || !Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid profile id' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(params.id).lean();

    if (!user) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(sanitizeProfile(user));
  } catch (error) {
    console.error('Error loading public profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
