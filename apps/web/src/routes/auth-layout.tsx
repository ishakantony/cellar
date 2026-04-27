import { Outlet } from 'react-router';
import { PublicOnly } from './auth-guard';

export function AuthLayout() {
  return (
    <PublicOnly>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </PublicOnly>
  );
}
