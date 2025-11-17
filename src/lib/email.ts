import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_SMTP_HOST,
  port: parseInt(process.env.NEXT_SMTP_PORT || '587'),
  secure: process.env.NEXT_SMTP_SECURE === 'true',
  auth: {
    user: process.env.NEXT_SMTP_USER,
    pass: process.env.NEXT_SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions = {
    from: `"${process.env.NEXT_EMAIL_FROM}" <${process.env.NEXT_SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - Nexus Events',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5;">Nexus Events</h1>
        </div>
        <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
        <p style="color: #4b5563; margin-bottom: 20px;">
          Thank you for registering with Nexus Events. Please use the following verification code to complete your registration:
        </p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #1f2937;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          This code will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

interface RegistrationEmailPayload {
  email: string;
  eventTitle: string;
  eventDate: Date;
  organizationName?: string;
}

export async function sendEventRegistrationEmail({ email, eventTitle, eventDate, organizationName = 'Nexus Events' }: RegistrationEmailPayload) {
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short'
      })
    : '';

  const mailOptions = {
    from: `"${process.env.NEXT_EMAIL_FROM}" <${process.env.NEXT_SMTP_USER}>`,
    to: email,
    subject: `You're registered for ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; margin-bottom: 4px;">${organizationName}</h1>
          <p style="color: #6b7280; margin: 0;">Event Registration Confirmation</p>
        </div>
        <div style="padding: 16px 20px; background: #f3f4f6; border-radius: 10px;">
          <p style="margin: 0 0 8px 0; color: #111827;">Hi there,</p>
          <p style="margin: 0; color: #4b5563;">You're all set for <strong>${eventTitle}</strong>.</p>
        </div>
        ${formattedDate ? `<p style="margin: 20px 0 8px 0; color: #111827;"><strong>Event Schedule:</strong> ${formattedDate}</p>` : ''}
        <p style="color: #4b5563; margin-top: 0;">You'll receive further updates from the organizer if there are any changes. We can't wait to see you there!</p>
        <p style="margin-top: 32px; color: #6b7280; font-size: 13px;">If you didn't make this registration, please contact support immediately.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
}

interface OrgInvitationPayload {
  email: string;
  name: string;
  temporaryPassword: string;
  role: 'staff' | 'coordinator';
  organizationName: string;
  invitedBy?: string;
}

export async function sendOrgInvitationEmail({
  email,
  name,
  temporaryPassword,
  role,
  organizationName,
  invitedBy,
}: OrgInvitationPayload) {
  const mailOptions = {
    from: `"${process.env.NEXT_EMAIL_FROM}" <${process.env.NEXT_SMTP_USER}>`,
    to: email,
    subject: `You're invited to ${organizationName} on Nexus Events`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; margin-bottom: 4px;">${organizationName}</h1>
          <p style="color: #6b7280; margin: 0;">Team Invitation</p>
        </div>
        <p style="color: #111827;">Hi ${name},</p>
        <p style="color: #4b5563;">${invitedBy || 'One of your admins'} has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong> on Nexus Events.</p>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #111827;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin: 8px 0 0 0; color: #111827;"><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        </div>
        <p style="color: #4b5563;">Use these credentials to log in and then update your password from the profile settings.</p>
        <p style="color: #4b5563;">Need help? Reply to this email or contact your administrator.</p>
        <p style="margin-top: 32px; color: #6b7280; font-size: 13px;">If you were not expecting this invitation, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending organization invitation email:', error);
  }
}
