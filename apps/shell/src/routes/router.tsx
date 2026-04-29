import { createBrowserRouter, Navigate } from 'react-router';
import { AuthGuard } from './auth-guard';

import { AuthLayout } from './auth-layout';
import { SignInPage } from './sign-in';
import { SignUpPage } from './sign-up';
import { AppLayout } from './app-layout';
import { ConsentPage } from './consent';
import { composeRegisteredFeatureRoutes } from '@/shell/route-composer';
import { registry, resolvedEntries } from '@/shell/feature-registry';

// Mount each registered feature under its `manifest.basePath`. The composer
// wraps every feature in the shell-owned error boundary so a crash in one
// feature can't take down the whole app.
const featureRoutes = composeRegisteredFeatureRoutes(registry, resolvedEntries);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/vault" replace />,
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
    children: [...featureRoutes],
  },
  {
    path: '*',
    element: <Navigate to="/vault" replace />,
  },
]);
