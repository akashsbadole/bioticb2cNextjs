'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from 'lucide-react';

export function RegisterPage() {
  const { navigate } = useAppStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      setDone(true);
      toast.success('Account created!');
      // Auto sign-in for convenience
      try {
        const res = await signIn('credentials', { email, password, redirect: false });
        if (!res || res.error) {
          router.push('/login');
          return;
        }
        router.refresh();
      } catch {
        /* ignore auto-login failure */
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <div className="rounded-[2rem] border shadow-xl p-8 text-center space-y-4">
          <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black">You&apos;re all set!</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a verification link to <span className="font-semibold">{email}</span>.
            Please verify your email to unlock all features.
          </p>
          <Button size="lg" className="w-full rounded-xl h-12 font-bold" onClick={() => navigate('account')}>
            Go to My Account
          </Button>
          <p className="text-sm text-muted-foreground">
            <button onClick={() => navigate('home')} className="font-semibold text-primary hover:underline">
              Continue shopping
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="rounded-[2rem] border shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black">Create Account</h1>
          <p className="text-muted-foreground mt-1">Join us to track orders and save favorites</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                placeholder="At least 8 characters"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 pl-10 rounded-xl"
                placeholder="Re-enter password"
                required
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full rounded-xl h-12 font-bold" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="font-semibold text-primary hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
