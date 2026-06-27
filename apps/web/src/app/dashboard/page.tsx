'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequireAuth } from '@/components/require-auth';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function DashboardInner() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <nav className="mb-6 flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="font-medium">
          Dashboard
        </Link>
        <Link href="/profile" className="text-muted-foreground">
          Profile
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="ml-auto"
        >
          Log out
        </Button>
      </nav>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard</CardTitle>
          <CardDescription>
            This page is protected by the API&apos;s JWT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="Name" value={user?.name ?? '—'} />
          <Row label="Role" value={user?.role ?? '—'} />
          <Row
            label="Member since"
            value={user ? new Date(user.createdAt).toLocaleDateString() : '—'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
