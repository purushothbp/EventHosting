import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/app/lib/mongo";
import { User, IUser } from "@/models";
import { authOptions } from "@/app/auth";
import { Types } from "mongoose";

// Ensure models are registered
import '@/models';

interface UserDocument extends IUser {
  _id: Types.ObjectId;
  image?: string;
  [key: string]: any;
}

export async function GET() {
  try {
    console.log('🔍 [GET /api/profile] Getting session...');
    
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('❌ [GET /api/profile] Not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log('✅ [GET /api/profile] Session found, connecting to database...');
    
    const { conn } = await connectToDatabase();
    
    if (!conn) {
      console.error('❌ [GET /api/profile] Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('🔍 [GET /api/profile] Fetching user profile...');
    
    // Find the user by email
    const user = await User.findOne({ email: session.user.email })
      .select('-password') // Exclude password
      .lean() as UserDocument | null;
    
    if (!user) {
      console.error('❌ [GET /api/profile] User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Convert MongoDB document to plain object with all profile fields
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      interests: user.interests || [],
      phone: user.phone,
      location: user.location,
      website: user.website,
      bio: user.bio,
      availableForHire: user.availableForHire,
      avatarUrl: user.avatarUrl,
      resumeUrl: user.resumeUrl,
      education: user.education || [],
      experience: user.experience || [],
      skills: user.skills || [],
      socialProfiles: user.socialProfiles || [],
      certifications: user.certifications || [],
      internships: user.internships || [],
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null
    };
    
    console.log('✅ [GET /api/profile] Profile fetched successfully');
    return NextResponse.json(userData);
    
  } catch (error) {
    console.error('❌ [GET /api/profile] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log('🔍 [PUT /api/profile] Getting session...');
    
    // Get the current session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('❌ [PUT /api/profile] Not authenticated');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let updateData: any = {};
    let resumeFile: File | null = null;
    let profileImage: File | null = null;

    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const data = formData.get('data');
      if (data) {
        updateData = JSON.parse(data as string);
      }
      resumeFile = formData.get('resume') as File | null;
      profileImage = formData.get('profileImage') as File | null;
    } else {
      // Handle regular JSON request
      updateData = await request.json();
    }
    
    console.log('✅ [PUT /api/profile] Session found, connecting to database...');
    
    const { conn } = await connectToDatabase();
    
    if (!conn) {
      console.error('❌ [PUT /api/profile] Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('🔍 [PUT /api/profile] Updating user profile...');

    // Handle file uploads if needed
    if (resumeFile) {
      // Handle resume file upload
      // updateData.resumeUrl = `path/to/uploaded/${resumeFile.name}`;
    }
    
    if (profileImage) {
      // Handle profile image upload
      // updateData.image = `path/to/uploaded/${profileImage.name}`;
    }
    
    // Prepare the update object with all possible profile fields
    const updateObj: any = {
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.phone !== undefined && { phone: updateData.phone }),
      ...(updateData.location !== undefined && { location: updateData.location }),
      ...(updateData.website !== undefined && { website: updateData.website }),
      ...(updateData.bio !== undefined && { bio: updateData.bio }),
      ...(updateData.availableForHire !== undefined && { availableForHire: updateData.availableForHire }),
      ...(updateData.department !== undefined && { department: updateData.department }),
      ...(updateData.year !== undefined && { year: updateData.year }),
      ...(updateData.interests !== undefined && { interests: updateData.interests }),
      ...(updateData.role !== undefined && { role: updateData.role }),
      ...(updateData.image !== undefined && { avatarUrl: updateData.image }),
      ...(updateData.resumeUrl !== undefined && { resumeUrl: updateData.resumeUrl }),
      updatedAt: new Date()
    };

    // Handle array fields with proper type checking
    if (Array.isArray(updateData.education)) {
      updateObj.education = updateData.education.map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        description: edu.description || '',
        gpa: edu.gpa || ''
      }));
    }

    if (Array.isArray(updateData.experience)) {
      updateObj.experience = updateData.experience.map((exp: any) => ({
        position: exp.position || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: Boolean(exp.current),
        description: exp.description || ''
      }));
    }

    if (Array.isArray(updateData.internships)) {
      updateObj.internships = updateData.internships.map((intern: any) => ({
        company: intern.company || '',
        position: intern.position || '',
        location: intern.location || '',
        startDate: intern.startDate || '',
        endDate: intern.endDate || '',
        current: Boolean(intern.current),
        description: intern.description || ''
      }));
    }

    if (Array.isArray(updateData.skills)) {
      console.log('Processing skills:', updateData.skills); // Debug log
      updateObj.skills = updateData.skills
        .filter((skill: any) => skill && skill.name) // Filter out invalid entries
        .map((skill: any) => ({
          name: String(skill.name || '').trim(),
          level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level) 
            ? skill.level 
            : 'intermediate',
          category: ['technical', 'soft', 'language', 'tool'].includes(skill.category)
            ? skill.category
            : 'technical'
        }));
      console.log('Processed skills:', updateObj.skills); // Debug log
    } else {
      console.log('No skills array found in updateData');
      updateObj.skills = [];
    }

    if (Array.isArray(updateData.socialProfiles)) {
      updateObj.socialProfiles = updateData.socialProfiles.map((profile: any) => ({
        platform: ['linkedin', 'github', 'twitter', 'portfolio', 'medium', 'other'].includes(profile.platform)
          ? profile.platform
          : 'other',
        url: profile.url || '',
        username: profile.username || ''
      }));
    }

    if (Array.isArray(updateData.certifications)) {
      updateObj.certifications = updateData.certifications.map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate || '',
        credentialUrl: cert.credentialUrl || ''
      }));
    }
    
    // Update the user in the database
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select('-password').lean() as unknown as IUser & { _id: Types.ObjectId };
    
    if (!updatedUser) {
      console.error('❌ [PUT /api/profile] User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ [PUT /api/profile] Profile updated successfully');
    
    // Return the complete updated user data
    const userResponse = {
      _id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      year: updatedUser.year,
      interests: updatedUser.interests || [],
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      bio: updatedUser.bio,
      availableForHire: updatedUser.availableForHire,
      avatarUrl: updatedUser.avatarUrl,
      resumeUrl: updatedUser.resumeUrl,
      education: updatedUser.education || [],
      experience: updatedUser.experience || [],
      skills: updatedUser.skills || [],
      socialProfiles: updatedUser.socialProfiles || [],
      certifications: updatedUser.certifications || [],
      createdAt: updatedUser.createdAt ? updatedUser.createdAt.toISOString() : null,
      updatedAt: updatedUser.updatedAt ? updatedUser.updatedAt.toISOString() : null
    };
    
    return NextResponse.json(userResponse);
    
  } catch (error) {
    console.error('❌ [PUT /api/profile] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
