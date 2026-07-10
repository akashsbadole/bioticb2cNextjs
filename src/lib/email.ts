import nodemailer from 'nodemailer';
import { db } from './db';

export async function getSiteSettings() {
  const settings = await db.siteSetting.findMany();
  return (key: string) => settings.find((s) => s.key === key)?.value || '';
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const getSetting = await getSiteSettings();
    const host = getSetting('smtp_host');
    if (!host) {
      console.log('SMTP not configured, skipping email');
      return false;
    }

    const user = getSetting('smtp_user');
    const pass = getSetting('smtp_pass');
    if (!user || !pass) {
      console.log('SMTP credentials not configured, skipping email');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(getSetting('smtp_port') || '587'),
      secure: parseInt(getSetting('smtp_port') || '587') === 465,
      auth: {
        user: getSetting('smtp_user'),
        pass: getSetting('smtp_pass'),
      },
    });

    const from = getSetting('email_from') || 'noreply@store.com';
    const siteName = getSetting('site_name') || 'Store';

    await transporter.sendMail({
      from: `"${siteName}" <${from}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

/**
 * Check if SMTP is configured and return status.
 * Used by admin UI to show warnings.
 */
export async function getSmtpStatus(): Promise<{ configured: boolean; host: string; user: string }> {
  const getSetting = await getSiteSettings();
  const host = getSetting('smtp_host');
  const user = getSetting('smtp_user');
  return {
    configured: !!(host && user),
    host: host || '',
    user: user || '',
  };
}

// Professional HTML email templates
function emailWrapper(siteName: string, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f5f5f5}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#059669,#0d9488);color:white;padding:30px;text-align:center;border-radius:12px 12px 0 0}.header h1{margin:0;font-size:24px}.content{background:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}.field-label{font-size:12px;text-transform:uppercase;color:#6b7280;letter-spacing:0.05em;margin-top:16px;margin-bottom:4px}.field-value{font-size:16px;color:#111827}.footer{text-align:center;padding:20px;color:#9ca3af;font-size:12px}.btn{display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600}</style></head><body><div class="container"><div class="header"><h1>${siteName}</h1></div><div class="content">${content}</div><div class="footer"><p>This email was sent from ${siteName}. Do not reply to this email.</p></div></div></body></html>`;
}

// Admin notification for new enquiry
export async function sendEnquiryNotificationToAdmin(enquiry: {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  quantity?: number;
  subject: string;
  message: string;
  type: string;
  productName?: string;
}) {
  const getSetting = await getSiteSettings();
  const siteEmail = getSetting('site_email') || 'admin@store.com';
  const siteName = getSetting('site_name') || 'Store';

  let content = `<h2 style="margin-top:0">New ${enquiry.type === 'rfq' ? 'RFQ' : 'Enquiry'} Received</h2>`;
  content += `<p>A new ${enquiry.type === 'rfq' ? 'Request for Quote' : 'enquiry'} has been submitted on your website.</p>`;
  content += `<div class="field-label">Contact Name</div><div class="field-value">${enquiry.name}</div>`;
  content += `<div class="field-label">Email</div><div class="field-value">${enquiry.email}</div>`;
  if (enquiry.phone) content += `<div class="field-label">Phone</div><div class="field-value">${enquiry.phone}</div>`;
  if (enquiry.companyName) content += `<div class="field-label">Company</div><div class="field-value">${enquiry.companyName}</div>`;
  if (enquiry.companyEmail) content += `<div class="field-label">Company Email</div><div class="field-value">${enquiry.companyEmail}</div>`;
  if (enquiry.companyPhone) content += `<div class="field-label">Company Phone</div><div class="field-value">${enquiry.companyPhone}</div>`;
  if (enquiry.companyAddress) content += `<div class="field-label">Company Address</div><div class="field-value">${enquiry.companyAddress}</div>`;
  if (enquiry.quantity) content += `<div class="field-label">Quantity Needed</div><div class="field-value">${enquiry.quantity} units</div>`;
  if (enquiry.productName) content += `<div class="field-label">Product</div><div class="field-value">${enquiry.productName}</div>`;
  content += `<div class="field-label">Subject</div><div class="field-value">${enquiry.subject}</div>`;
  content += `<div class="field-label">Message</div><div class="field-value">${enquiry.message.replace(/\n/g, '<br>')}</div>`;

  return sendEmail(
    siteEmail,
    `[${siteName}] New ${enquiry.type === 'rfq' ? 'RFQ' : 'Enquiry'}: ${enquiry.subject}`,
    emailWrapper(siteName, content)
  );
}

// Auto-reply confirmation to the customer
export async function sendEnquiryConfirmation(enquiry: {
  name: string;
  email: string;
  subject: string;
  type: string;
  productName?: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteEmail = getSetting('site_email') || 'admin@store.com';
  const sitePhone = getSetting('site_phone') || '';

  let content = `<h2 style="margin-top:0">Thank You for Your Enquiry!</h2>`;
  content += `<p>Dear ${enquiry.name},</p>`;
  content += `<p>Thank you for your interest in ${enquiry.productName ? `<strong>${enquiry.productName}</strong>` : 'our products'}. We have received your ${enquiry.type === 'rfq' ? 'Request for Quote' : 'enquiry'} and our team will get back to you within 24 hours.</p>`;
  content += `<h3>Your Enquiry Details</h3>`;
  content += `<p><strong>Subject:</strong> ${enquiry.subject}</p>`;
  content += `<p><strong>Reference:</strong> #${Date.now().toString(36).toUpperCase()}</p>`;
  content += `<div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #059669">`;
  content += `<p style="margin:0;color:#065f46"><strong>What happens next?</strong></p>`;
  content += `<p style="margin:8px 0 0;color:#065f46">Our team will review your enquiry and respond within 24 business hours. If your matter is urgent, please contact us directly.</p>`;
  content += `</div>`;
  if (sitePhone) content += `<p style="margin-top:16px">Need immediate assistance? Call us at <strong>${sitePhone}</strong></p>`;

  return sendEmail(
    enquiry.email,
    `Thank you for your enquiry - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

// Keep backward compatibility
export async function sendEnquiryNotification(enquiry: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}) {
  return sendEnquiryNotificationToAdmin(enquiry);
}
