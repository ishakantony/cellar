import { Outlet } from 'react-router';
import { useSession } from '@/lib/auth-client';
import { AppShell } from '@/components/layout/app-shell';

export function AppLayout() {
  const { data, isPending } = useSession();

  if (isPending || !data?.user) {
    return (
      <div className="flex h-full items-center justify-center text-(--color-text-muted)">
        Loading…
      </div>
    );
  }

  const user = {
    name: data.user.name,
    email: data.user.email,
    image: data.user.image ?? null,
  };

  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
