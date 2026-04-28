import { useEffect } from 'react';
import { createBrowserRouter, Navigate, useNavigate, useParams } from 'react-router';
import { AuthGuard } from './auth-guard';

import { AuthLayout } from './auth-layout';
import { SignInPage } from './sign-in';
import { SignUpPage } from './sign-up';
import { AppLayout } from './app-layout';
import { DashboardPage } from './dashboard';
import { AssetsListPage } from './assets/index';

import { CollectionsListPage } from './collections/index';
import { CollectionDetailPage } from './collections/$id';
import { SettingsPage } from './settings';
import { ConsentPage } from './consent';
import { useAssetDrawer } from '@/hooks/use-asset-drawer';

/** Redirect /assets/:id → /assets and open the drawer in view mode */
function AssetIdRedirect() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const openView = useAssetDrawer(s => s.openView);

  useEffect(() => {
    if (id) openView(id);
    void navigate('/assets', { replace: true });
  }, [id, navigate, openView]);

  return null;
}

/** Redirect /assets/new → /assets and open the drawer in create mode */
function AssetNewRedirect() {
  const navigate = useNavigate();
  const openCreate = useAssetDrawer(s => s.openCreate);

  useEffect(() => {
    openCreate();
    void navigate('/assets', { replace: true });
  }, [navigate, openCreate]);

  return null;
}

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
      { path: '/assets/new', element: <AssetNewRedirect /> },
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
