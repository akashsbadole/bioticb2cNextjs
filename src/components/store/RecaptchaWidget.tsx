"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Loader2 } from "lucide-react";

interface RecaptchaWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    recaptchaLoaded: () => void;
  }
}

export function RecaptchaWidget({ siteKey, onVerify, onExpire }: RecaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window.grecaptcha !== "undefined" && window.grecaptcha.render) {
      setReady(true);
      return;
    }

    window.recaptchaLoaded = () => setReady(true);

    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?onload=recaptchaLoaded&render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || widgetId.current !== null) return;
    widgetId.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      "expired-callback": () => {
        widgetId.current = null;
        onExpire?.();
      },
    });
  }, [ready, siteKey, onVerify, onExpire]);

  const reset = useCallback(() => {
    if (widgetId.current !== null) {
      window.grecaptcha.reset(widgetId.current);
      widgetId.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (widgetId.current !== null) {
        try { window.grecaptcha.reset(widgetId.current); } catch { /* ignore */ }
        widgetId.current = null;
      }
    };
  }, []);

  return (
    <div className="flex justify-center">
      {!ready ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading reCAPTCHA...
        </div>
      ) : null}
      <div ref={containerRef} />
    </div>
  );
}
