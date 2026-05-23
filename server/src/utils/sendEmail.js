import nodemailer from 'nodemailer';

/**
 * Sends a highly polished Flipkart transaction receipt email to purchasers.
 * Elegant HTML container styled with Flipkart blue header bar and line items table.
 */
export async function sendEmail({ to, subject, html }) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes('YOUR_') || pass.includes('YOUR_')) {
    console.log('--- COPIED RECEIPT EMAIL (Credentials Missing/Dummy in Env) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Snippet:\n', html.substring(0, 500) + '...\n--------------------------------------------------------------');
    return true; // proceed without error
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Flipkart Notification" <${user}>`,
      to,
      subject,
      html,
    });
    console.log(`Successfully dispatched e-receipt to ${to}`);
    return true;
  } catch (err) {
    console.error('Nodemailer verification failed/invalid App Password:', err.message);
    return false;
  }
}
