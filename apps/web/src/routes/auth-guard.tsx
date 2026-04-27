import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../lib/auth-client';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center text-(--color-text-muted)">
        Loading…
      </div>
    );
  }

  if (!data?.user) {
    const callbackURL = location.pathname + location.search;
    const search =
      callbackURL && callbackURL !== '/' ? `?callbackURL=${encodeURIComponent(callbackURL)}` : '';
    return <Navigate to={`/sign-in${search}`} replace />;
  }

  return <>{children}</>;
}

export function PublicOnly({ children }: AuthGuardProps) {
  const { data, isPending } = useSession();
  if (isPending) return null;
  if (data?.user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
