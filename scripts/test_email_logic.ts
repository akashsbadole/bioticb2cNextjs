import { sendEmail } from '../src/lib/email';

async function testEmail() {
  console.log('Testing email sending...');
  const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test Content</p>');
  if (result) {
    console.log('Email sent successfully!');
  } else {
    console.log('Email sending failed (likely due to missing SMTP configuration).');
  }
}

testEmail().catch(console.error);
