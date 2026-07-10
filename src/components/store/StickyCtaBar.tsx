'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyCtaBarProps {
  onNavigate: (page: string, data?: unknown) => void;
  settings?: Record<string, string> | null;
}

export function StickyCtaBar({ onNavigate, settings }: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);

  const whatsappNumber = settings?.whatsapp_number || '';
  const contactPhone = settings?.contact_phone || '';

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed bar */}
      <div className="h-[60px]" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-gray-900 px-4 py-3 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium">Ready to manufacture at scale?</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => onNavigate('products')}
            >
              Get bulk quote
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            {whatsappNumber && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-400 hover:bg-green-600/20"
                onClick={() =>
                  window.open(
                    `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`,
                    '_blank'
                  )
                }
              >
                <MessageCircle className="mr-1 h-3 w-3" />
                WhatsApp us
              </Button>
            )}
            {contactPhone && (
              <Button
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-white/10"
                onClick={() => window.open(`tel:${contactPhone}`)}
              >
                <Phone className="mr-1 h-3 w-3" />
                {contactPhone}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
