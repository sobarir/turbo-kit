'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RequireAuth } from '@/components/require-auth';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ProfileInner() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setStatus('');
    setError('');
    setBusy(true);
    try {
      await api.users.updateMe({ name: name || undefined });
      await refreshUser();
      setStatus('Saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <nav className="mb-6 flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="text-muted-foreground">
          Dashboard
        </Link>
        <Link href="/profile" className="font-medium">
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
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>
            Update your account. Writes to PATCH /users/me.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email ?? ''} disabled />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {status && <p className="text-sm text-green-600">{status}</p>}
          <Button onClick={onSave} disabled={busy} className="w-fit">
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
