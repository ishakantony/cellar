import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { AuthGuard } from './auth-guard';

import { AuthLayout } from './auth-layout';
import { SignInPage } from './sign-in';
import { SignUpPage } from './sign-up';
import { AppLayout } from './app-layout';
import { DashboardPage } from './dashboard';
import { AssetsListPage } from './assets/index';

function AssetIdRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/assets?id=${id}`} replace />;
}
import { CollectionsListPage } from './collections/index';
import { CollectionDetailPage } from './collections/$id';
import { SettingsPage } from './settings';
import { ConsentPage } from './consent';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/sign-up', element: <SignUpPage /> },
    ],
  },
  {
    path: '/consent',
    element: <ConsentPage />,
  },
  {
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/assets', element: <AssetsListPage /> },
      { path: '/assets/new', element: <Navigate to="/assets?new=1" replace /> },
      { path: '/assets/:id', element: <AssetIdRedirect /> },
      { path: '/assets/:id/edit', element: <AssetIdRedirect /> },
      { path: '/collections', element: <CollectionsListPage /> },
      { path: '/collections/:id', element: <CollectionDetailPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
