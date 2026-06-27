'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

// Wrap protected pages with this. Redirects to /login when not authenticated.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return null;

  return <>{children}</>;
}
