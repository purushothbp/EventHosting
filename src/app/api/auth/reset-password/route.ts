import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongo';
import { hash } from 'bcryptjs';
import mongoose, { Document } from 'mongoose';

interface PasswordResetDocument extends Document {
  email: string;
  otp: string;
  used: boolean;
  expiresAt: Date;
  userId: mongoose.Types.ObjectId;
}

export async function POST(request: Request) {
  try {
    console.log('Reset password request received');
    const { email, otp, newPassword } = await request.json();
    
    if (!email || !otp || !newPassword) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    const { conn } = await connectToDatabase().catch(err => {
      console.error('Database connection error:', err);
      throw new Error(`Database connection failed: ${err.message}`);
    });

    if (!conn || !conn.connection?.db) {
      const error = 'Database connection not properly initialized';
      console.error(error);
      throw new Error(error);
    }
    
    const db = conn.connection.db;
    
    // Find the reset record
    console.log(`Looking up reset record for email: ${email}`);
    const resetRecord = await db.collection<PasswordResetDocument>('passwordResets').findOne({
      email,
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetRecord) {
      console.log('Invalid or expired OTP');
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    console.log('Hashing new password...');
    const hashedPassword = await hash(newPassword, 12);

    console.log('Updating user password...');
    const updateResult = await db.collection('users').updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.matchedCount === 0) {
      console.error('User not found:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Marking OTP as used...');
    await db.collection('passwordResets').updateOne(
      { _id: resetRecord._id },
      { $set: { used: true } }
    );

    console.log('Password reset successful for:', email);
    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Reset password error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    // Return more detailed error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: 'Failed to reset password',
        details: isDevelopment ? errorMessage : undefined 
      },
      { status: 500 }
    );
  }
}
