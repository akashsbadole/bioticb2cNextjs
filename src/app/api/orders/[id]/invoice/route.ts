import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/admin-auth';
import PDFDocument from 'pdfkit';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await params;
    const auth = await requireAuth(_request);
    if (!auth.success) return auth.response;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { Product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only the owner or an admin can view the invoice
    const isOwner = order.userId === auth.payload.userId;
    const isAdmin = ['admin', 'editor'].includes(auth.payload.role);
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settings = await db.siteSetting.findMany({
      where: { storeId: order.storeId ? order.storeId : null },
    });
    const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;
    const siteName = getSetting('site_name') || 'Store';
    const siteEmail = getSetting('site_email') || '';
    const sitePhone = getSetting('site_phone') || '';
    const currency = getSetting('currency') || 'INR';

    let shippingAddress: Record<string, string> = {};
    try {
      shippingAddress = JSON.parse(order.shippingAddress || '{}');
    } catch {}

    const doc = new PDFDocument({ margin: 50 });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {});

    const leftMargin = 50;
    const pageWidth = 525;

    // ── Header ──
    doc.fontSize(24).font('Helvetica-Bold').text(siteName, leftMargin, 50);
    doc.fontSize(10).font('Helvetica').fillColor('#666');
    doc.text(siteEmail, leftMargin, 78);
    if (sitePhone) doc.text(sitePhone, leftMargin, 93);
    doc.fillColor('#000');

    // Invoice title
    doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', leftMargin, 130);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Order #${order.id.slice(0, 8).toUpperCase()}`, leftMargin, 153);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`, leftMargin, 168);
    doc.text(`Payment: ${order.paymentMethod?.toUpperCase() || 'N/A'} — ${order.paymentStatus}`, leftMargin, 183);

    // ── Bill To ──
    const billToX = pageWidth / 2 + leftMargin;
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To', billToX, 130);
    doc.fontSize(10).font('Helvetica');
    doc.text(order.customerName || '', billToX, 148);
    doc.text(order.customerEmail || '', billToX, 163);
    if (order.customerPhone) doc.text(order.customerPhone, billToX, 178);
    const addrLines = [shippingAddress.address, shippingAddress.city, shippingAddress.state, shippingAddress.zipCode].filter(Boolean);
    addrLines.forEach((line, i) => doc.text(line, billToX, 193 + i * 15));

    // ── Items table ──
    const tableTop = 280;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    doc.rect(leftMargin, tableTop - 8, pageWidth, 22).fill('#f5f5f5').stroke('#ddd');
    doc.fillColor('#333');
    doc.text('Item', leftMargin + 8, tableTop + 2);
    doc.text('Qty', leftMargin + 300, tableTop + 2, { width: 40, align: 'center' });
    doc.text('Price', leftMargin + 350, tableTop + 2, { width: 70, align: 'right' });
    doc.text('Total', leftMargin + 430, tableTop + 2, { width: 70, align: 'right' });

    doc.font('Helvetica').fillColor('#000');
    let y = tableTop + 30;
    for (const item of order.items) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      const itemTotal = item.price * item.quantity;
      doc.text(item.name, leftMargin + 8, y, { width: 280 });
      doc.text(String(item.quantity), leftMargin + 300, y, { width: 40, align: 'center' });
      doc.text(formatPDFPrice(item.price, currency), leftMargin + 350, y, { width: 70, align: 'right' });
      doc.text(formatPDFPrice(itemTotal, currency), leftMargin + 430, y, { width: 70, align: 'right' });
      y += 22;
    }

    // ── Totals ──
    y += 10;
    doc.rect(leftMargin, y - 6, pageWidth, 90).stroke('#ddd');
    const totalX = leftMargin + 300;
    const totalValX = leftMargin + 430;

    doc.font('Helvetica').fillColor('#333');
    doc.text('Subtotal', totalX, y); doc.text(formatPDFPrice(order.subtotal, currency), totalValX, y, { width: 70, align: 'right' });
    if (order.discount > 0) {
      y += 18;
      doc.text('Discount', totalX, y); doc.text(`-${formatPDFPrice(order.discount, currency)}`, totalValX, y, { width: 70, align: 'right' });
    }
    y += 18;
    doc.text('Shipping', totalX, y); doc.text(order.shipping === 0 ? 'Free' : formatPDFPrice(order.shipping, currency), totalValX, y, { width: 70, align: 'right' });
    y += 18;
    doc.text('Tax', totalX, y); doc.text(formatPDFPrice(order.tax, currency), totalValX, y, { width: 70, align: 'right' });
    y += 22;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total', totalX, y); doc.text(formatPDFPrice(order.totalAmount, currency), totalValX, y, { width: 70, align: 'right' });

    // ── Tracking ──
    if (order.trackingNumber) {
      y += 40;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
      doc.text('Tracking Number:', leftMargin, y);
      doc.font('Helvetica').fillColor('#059669');
      doc.text(order.trackingNumber, leftMargin, y + 16);
    }

    // ── Footer ──
    doc.fontSize(8).font('Helvetica').fillColor('#999');
    doc.text('Thank you for your purchase!', leftMargin, 740, { align: 'center', width: pageWidth });

    doc.end();

    return new NextResponse(Buffer.concat(chunks), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${orderId.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Invoice error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

function formatPDFPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
