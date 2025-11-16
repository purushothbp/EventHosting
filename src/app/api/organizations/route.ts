import { NextResponse } from "next/server";
import Organization from "@/models/Organization";
import User from "@/models/user";
import mongoose, { Types } from 'mongoose';
import { hash } from 'bcryptjs';

// Ensure models are registered
import '@/models';
import { connectToDatabase } from "@/app/lib/mongo";

// GET all organizations
export async function GET() {
  try {
    console.log('🔍 [GET /api/organizations] Connecting to database...');
    
    const { conn } = await connectToDatabase();
    
    if (!conn) {
      console.error('❌ [GET /api/organizations] Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('✅ [GET /api/organizations] Database connected');
    
    if (!mongoose.models.Organization) {
      console.error('❌ [GET /api/organizations] Organization model not registered');
      return NextResponse.json(
        { error: 'Server configuration error: Organization model not registered' },
        { status: 500 }
      );
    }
    
    console.log('🔍 [GET /api/organizations] Fetching organizations...');
    const organizations = await Organization.find()
      .populate('admins', 'name email')
      .populate('coordinators', 'name email')
      .sort({ name: 1 })
      .lean()
      .maxTimeMS(10000);

    // Convert MongoDB objects to plain objects
    const serialized = organizations.map((org: any) => ({
      ...org,
      _id: org._id.toString(),
      admins: org.admins.map((admin: any) => ({
        _id: admin._id.toString(),
        name: admin.name,
        email: admin.email
      })),
      coordinators: org.coordinators.map((coord: any) => ({
        _id: coord._id.toString(),
        name: coord.name,
        email: coord.email
      })),
      createdAt: org.createdAt?.toISOString(),
      updatedAt: org.updatedAt?.toISOString()
    }));

    console.log(`✅ [GET /api/organizations] Found ${serialized.length} organizations`);
    return NextResponse.json(serialized);
    
  } catch (error) {
    console.error('❌ [GET /api/organizations] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch organizations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Create a new organization
export async function POST(req: Request) {
  try {
    console.log('🔄 [POST /api/organizations] Processing request...');
    const { name, tagline, logoUrl, watermarkUrl, admin } = await req.json();

    // Input validation
    if (!name || !admin?.email || !admin?.password || !admin?.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    const { conn } = await connectToDatabase();
    if (!conn) {
      console.error('❌ [POST /api/organizations] Database connection failed');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if organization already exists
      const existingOrg = await Organization.findOne({ name }).session(session);
      if (existingOrg) {
        return NextResponse.json(
          { error: 'An organization with this name already exists' },
          { status: 400 }
        );
      }

      // Check if admin email is already registered
      const existingUser = await User.findOne({ email: admin.email }).session(session);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await hash(admin.password, 12);

      // Create organization
      const organization = new Organization({
        name,
        tagline,
        logoUrl,
        watermarkUrl,
        admins: [],
        coordinators: []
      });

      const savedOrg = await organization.save({ session });

      // Create admin user
      const user = new User({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: 'admin',
        organization: savedOrg._id
      });

      const savedUser = await user.save({ session });

      // Add admin to organization
      savedOrg.admins.push(savedUser._id);
      await savedOrg.save({ session });

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      console.log('✅ [POST /api/organizations] Organization created successfully');
      
      return NextResponse.json({
        success: true,
        organization: {
          ...savedOrg.toObject(),
          _id: savedOrg._id.toString(),
          admins: [{
            _id: savedUser._id.toString(),
            name: savedUser.name,
            email: savedUser.email
          }]
        }
      });

    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (error) {
    console.error('❌ [POST /api/organizations] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create organization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
