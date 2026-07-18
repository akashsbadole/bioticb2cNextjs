import nodemailer from 'nodemailer';
import { db } from './db';
import { decryptSetting } from './encryption';

export async function getSiteSettings() {
  const settings = await db.siteSetting.findMany();
  return (key: string) => {
    const val = settings.find((s) => s.key === key)?.value || '';
    return decryptSetting(val);
  };
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

// Order confirmation to customer
export async function sendOrderConfirmation(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  let content = `<h2 style="margin-top:0">Order Confirmed!</h2>`;
  content += `<p>Dear ${order.customerName},</p>`;
  content += `<p>Thank you for your order. We'll send you a notification when it ships.</p>`;
  content += `<div class="field-label">Order ID</div><div class="field-value">${order.id.slice(0, 8)}</div>`;
  content += `<div class="field-label">Payment Method</div><div class="field-value">${order.paymentMethod}</div>`;
  content += `<div class="field-label">Total Paid</div><div class="field-value">${order.totalAmount.toFixed(2)}</div>`;
  content += `<h3 style="margin-top:24px">Items</h3>`;
  for (const item of order.items) {
    content += `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb"><span>${item.name} x ${item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></div>`;
  }
  content += `<div style="margin-top:24px;text-align:center"><a href="${siteUrl}/invoice/${order.id}" class="btn">View Invoice</a></div>`;

  return sendEmail(
    order.customerEmail,
    `Order Confirmation - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

// Tracking update notification
export async function sendTrackingUpdate(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  trackingNumber: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `
    <h2 style="margin-top:0">Your Order Has Shipped!</h2>
    <p>Dear ${order.customerName},</p>
    <p>Your order <strong>#${order.id.slice(0, 8)}</strong> is on its way!</p>
    <div class="field-label">Tracking Number</div>
    <div class="field-value" style="font-family:monospace">${order.trackingNumber}</div>
    <div style="margin-top:24px;text-align:center">
      <a href="${siteUrl}/invoice/${order.id}" class="btn">View Invoice</a>
    </div>
  `;

  return sendEmail(
    order.customerEmail,
    `Your order has shipped - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

// ── Enquiry / Contact notifications ──

export async function sendEnquiryNotificationToAdmin(enquiry: {
  name: string;
  email: string;
  phone?: string;
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
  if (enquiry.productName) content += `<div class="field-label">Product</div><div class="field-value">${enquiry.productName}</div>`;
  content += `<div class="field-label">Subject</div><div class="field-value">${enquiry.subject}</div>`;
  content += `<div class="field-label">Message</div><div class="field-value">${enquiry.message.replace(/\n/g, '<br>')}</div>`;

  return sendEmail(
    siteEmail,
    `[${siteName}] New ${enquiry.type === 'rfq' ? 'RFQ' : 'Enquiry'}: ${enquiry.subject}`,
    emailWrapper(siteName, content)
  );
}

export async function sendEnquiryConfirmation(enquiry: {
  name: string;
  email: string;
  subject: string;
  type: string;
  productName?: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';

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

  return sendEmail(
    enquiry.email,
    `Thank you for your enquiry - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

export async function sendEnquiryNotification(enquiry: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
}) {
  return sendEnquiryNotificationToAdmin(enquiry);
}

// Welcome email on registration
export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `
    <h2 style="margin-top:0">Welcome to ${siteName}!</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for creating an account with us. We're excited to have you on board!</p>
    <p>With your account you can:</p>
    <ul>
      <li>Browse our full product catalog</li>
      <li>Track your orders in real-time</li>
      <li>Save items to your wishlist</li>
      <li>Access exclusive B2B pricing (if applicable)</li>
    </ul>
    <div style="margin-top:24px;text-align:center">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/catalogue" class="btn">Start Shopping</a>
    </div>
  `;

  return sendEmail(
    user.email,
    `Welcome to ${siteName}!`,
    emailWrapper(siteName, content)
  );
}

// Newsletter subscription confirmation
export async function sendNewsletterConfirmation(subscriber: {
  email: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `
    <h2 style="margin-top:0">You're Subscribed!</h2>
    <p>Thank you for subscribing to the ${siteName} newsletter.</p>
    <p>You'll be the first to hear about new products, offers, and updates.</p>
    <div style="margin-top:24px;text-align:center">
      <a href="${siteUrl}/catalogue" class="btn">Browse Products</a>
    </div>
  `;

  return sendEmail(
    subscriber.email,
    `Newsletter subscription confirmed - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

// Back-in-stock notification to customer
export async function sendBackInStockNotification(subscriber: {
  email: string;
  productName: string;
  productSlug: string;
}) {
  const getSetting = await getSiteSettings();
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `
    <h2 style="margin-top:0">Back in Stock!</h2>
    <p>Great news — <strong>${subscriber.productName}</strong> is back in stock!</p>
    <p>You requested to be notified when this product became available again.</p>
    <div style="margin-top:24px;text-align:center">
      <a href="${siteUrl}/products/${subscriber.productSlug}" class="btn">Shop Now</a>
    </div>
  `;

  return sendEmail(
    subscriber.email,
    `${subscriber.productName} is back in stock - ${siteName}`,
    emailWrapper(siteName, content)
  );
}

// Low stock alert to admin
export async function sendLowStockAlert(alert: {
  productName: string;
  sku?: string | null;
  stock: number;
  lowStockThreshold: number;
}) {
  const getSetting = await getSiteSettings();
  const siteEmail = getSetting('site_email') || 'admin@store.com';
  const siteName = getSetting('site_name') || 'Store';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const content = `
    <h2 style="margin-top:0">⚠️ Low Stock Alert</h2>
    <p>The following product is running low on stock:</p>
    <div class="field-label">Product</div><div class="field-value">${alert.productName}</div>
    ${alert.sku ? `<div class="field-label">SKU</div><div class="field-value">${alert.sku}</div>` : ''}
    <div class="field-label">Current Stock</div><div class="field-value">${alert.stock}</div>
    <div class="field-label">Threshold</div><div class="field-value">${alert.lowStockThreshold}</div>
    <div style="margin-top:24px;text-align:center">
      <a href="${siteUrl}/admin/products" class="btn">Restock Now</a>
    </div>
  `;

  return sendEmail(
    siteEmail,
    `[${siteName}] Low stock: ${alert.productName}`,
    emailWrapper(siteName, content)
  );
}


