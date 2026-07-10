'use client';

import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    const dismissed = sessionStorage.getItem('cookie-consent-dismissed');
    if (!consent && !dismissed) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: true, essentialOnly: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ accepted: true, essentialOnly: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const handleDismiss = () => {
    // Use session storage to hide for current session only
    // This prevents banner from reappearing on every page load
    // but still shows on next visit (GDPR compliant)
    sessionStorage.setItem('cookie-consent-dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-primary/20 bg-background/95 backdrop-blur-sm p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              We use cookies to improve your experience.
            </p>
            <p className="text-xs text-muted-foreground">
              We use essential cookies to make our site work, and optional analytics cookies to understand how you interact with it. You can accept all cookies or reject non-essential ones.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-primary hover:bg-primary/80 text-white"
              >
                Accept All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRejectNonEssential}
                className="border-primary/20 text-primary/80 hover:bg-primary/5"
              >
                Reject Non-Essential
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
