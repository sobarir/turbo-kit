'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Turbo Kit</CardTitle>
          <CardDescription>
            Next.js frontend wired to the NestJS API.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : user ? (
            <>
              <p className="text-sm">
                Signed in as <strong>{user.email}</strong>
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register">Create account</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
