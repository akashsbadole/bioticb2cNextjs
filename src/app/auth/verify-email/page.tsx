'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const { navigate } = useAppStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    fetch(`/api/account/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-32 max-w-md text-center">
      <div className="rounded-[2rem] border shadow-xl p-10 space-y-6">
        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />}
        {status === 'success' && (
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        )}
        {status === 'error' && (
          <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-8 w-8" />
          </div>
        )}
        <h1 className="text-2xl font-black">
          {status === 'success' ? 'Email Verified' : status === 'error' ? 'Verification Failed' : 'Verifying…'}
        </h1>
        <p className="text-muted-foreground">{message}</p>
        {status === 'success' && (
          <Button size="lg" className="rounded-full px-10" onClick={() => navigate('login')}>
            Continue to Sign In
          </Button>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
