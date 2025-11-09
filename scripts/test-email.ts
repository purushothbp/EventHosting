import nodemailer from 'nodemailer';

async function testEmail() {
  // Create a test account
  const testAccount = await nodemailer.createTestAccount();
  console.log('Test account created:', testAccount.user);

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    debug: true,
    logger: true
  });

  try {
    // Send a test email
    const info = await transporter.sendMail({
      from: '"Test Sender" <test@example.com>',
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
      html: '<b>This is a test email</b>'
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail().catch(console.error);
