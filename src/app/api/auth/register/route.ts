import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongo';
import User from '@/models/user';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    // Basic validation
    if (!name || !normalizedEmail || !password) {
      return NextResponse.json(
        { 
          success: false,
          message: 'All fields are required',
          field: !name ? 'name' : !normalizedEmail ? 'email' : 'password'
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Please enter a valid email address',
          field: 'email'
        },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Password must be at least 8 characters long',
          field: 'password'
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail, emailVerified: true });
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          message: 'An account with this email already exists. Please try logging in instead.',
          field: 'email'
        },
        { status: 400 }
      );
    }

    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      
      console.log('Generated OTP:', {
        email: normalizedEmail,
        otp,
        expiresAt: otpExpiry,
        currentTime: new Date()
      });

      // Either create new unverified user or refresh OTP on existing unverified account
      const existingUnverified = await User.findOne({ email: normalizedEmail, emailVerified: false });

      if (existingUnverified) {
        existingUnverified.name = name;
        existingUnverified.password = password;
        existingUnverified.otp = otp;
        existingUnverified.otpExpiry = otpExpiry;
        await existingUnverified.save();
      } else {
        const user = new User({
          name,
          email: normalizedEmail,
          password,
          emailVerified: false,
          otp,
          otpExpiry,
          clerkId: undefined
        });
        await user.save();
      }

      // Send verification email
      await sendVerificationEmail(normalizedEmail, otp);

      return NextResponse.json({
        success: true,
        message: 'Verification OTP sent to your email',
        email: normalizedEmail // Return the email for the frontend to use in the next step
      }, { status: 201 });
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError);
      
      // Handle duplicate key error (clerkId unique constraint)
      if (dbError.code === 11000) {
        return NextResponse.json({
          success: false,
          message: 'An error occurred during registration. Please try again.'
        }, { status: 400 });
      }
      
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({
          success: false,
          message: 'This email is already registered. Please try logging in instead.'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    }, { status: 500 });
  }
}
