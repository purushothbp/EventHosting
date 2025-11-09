// Update the forgot-password route to use Nodemailer
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongo';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_SMTP_HOST,
  port: parseInt(process.env.NEXT_SMTP_PORT!),
  secure: process.env.NEXT_SMTP_SECURE === 'true',
  auth: {
    user: process.env.NEXT_SMTP_USER!,
    pass: process.env.NEXT_SMTP_PASSWORD!,
  },
  tls: {
    // Do not fail on invalid certs in development
    rejectUnauthorized: process.env.NEXT_NODE_ENV === 'production'
  },
  debug: process.env.NEXT_NODE_ENV !== 'production', // Enable debug logging in development
  logger: process.env.NEXT_NODE_ENV !== 'production' // Log to console in development
});

export async function POST(request: Request) {
  try {
    console.log('Forgot password request received');
    const { email } = await request.json();
    
    if (!email) {
      console.log('No email provided');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to connect to database...');
    // Connect to MongoDB
    const { conn } = await connectToDatabase().catch(err => {
      console.error('Database connection error:', err);
      throw new Error(`Database connection failed: ${err.message}`);
    });

    if (!conn) {
      const error = 'Failed to establish database connection: No connection object returned';
      console.error(error);
      throw new Error(error);
    }

    // Get the database instance with null check
    if (!conn.connection?.db) {
      const error = 'Database connection not properly initialized';
      console.error(error);
      throw new Error(error);
    }
    const db = conn.connection.db;
    console.log('Successfully connected to database');
    
    // Check if user exists
    console.log(`Looking up user with email: ${email}`);
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }
    console.log(`User found: ${user._id}`);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save OTP to database
    await db.collection('passwordResets').updateOne(
      { email },
      { 
        $set: { 
          otp,
          expiresAt,
          used: false 
        } 
      },
      { upsert: true }
    );

    // Verify SMTP configuration
    console.log('SMTP Configuration:', {
      host: process.env.NEXT_SMTP_HOST,
      port: process.env.NEXT_SMTP_PORT,
      user: process.env.NEXT_SMTP_USER ? '***' : 'Not set',
      secure: process.env.NEXT_SMTP_SECURE,
      nodeEnv: process.env.NEXT_NODE_ENV
    });

    // Validate email configuration before sending
    const fromEmail = process.env.NEXT_SMTP_USER;
    if (!fromEmail) {
      const error = 'SMTP user email is not configured';
      console.error(error);
      throw new Error(error);
    }

    if (!process.env.NEXT_SMTP_PASSWORD) {
      const error = 'SMTP password is not configured';
      console.error(error);
      throw new Error(error);
    }

    console.log('Sending email to:', email);
    const mailOptions = {
      from: `"EventHosting" <${fromEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eaeaea; margin-bottom: 20px; position: relative;">
            <h1 style="margin: 0; color: #333;">EventHosting</h1>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 60px; font-weight: bold; opacity: 0.05; z-index: -1; white-space: nowrap;">
              EventHosting
            </div>
          </div>
          <div style="padding: 20px 0;">
            <h2 style="margin-top: 0;">Password Reset Request</h2>
            <p>We received a request to reset your password. Your OTP is:</p>
            <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 0.5rem; padding: 10px 20px; background-color: #f3f4f6; display: inline-block; border-radius: 4px;">
              ${otp}
            </h2>
            <p>This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666; text-align: center;">
            <p>© ${new Date().getFullYear()} EventHosting. All rights reserved.</p>
            <p>If you didn't request this email, you can safely ignore it.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      return NextResponse.json({ 
        message: 'Password reset OTP sent to your email',
        previewUrl: nodemailer.getTestMessageUrl(info) // Only in development
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Forgot password error:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    // Return more detailed error information in development
    const isDevelopment = process.env.NEXT_NODE_ENV === 'development';
    return NextResponse.json(
      { 
        error: 'Failed to process forgot password request',
        details: isDevelopment ? errorMessage : undefined 
      },
      { status: 500 }
    );
  }
}