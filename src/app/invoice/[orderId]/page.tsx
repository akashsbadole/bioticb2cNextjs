import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { InvoicePageClient } from './InvoicePageClient';

interface InvoicePageProps {
  params: Promise<{ orderId: string }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      User: { select: { name: true, email: true, phone: true } },
      Store: { select: { name: true, logo: true } },
    },
  });

  if (!order) {
    notFound();
  }

  const storeSettings = order.storeId
    ? await db.siteSetting.findMany({ where: { storeId: order.storeId } })
    : [];
  const getSetting = (key: string) => storeSettings.find(s => s.key === key)?.value ?? null;

  return (
    <InvoicePageClient
      order={order}
      companyGstin={getSetting('company_gstin')}
      siteEmail={getSetting('site_email')}
      sitePhone={getSetting('site_phone')}
      siteAddress={getSetting('site_address')}
    />
  );
}
