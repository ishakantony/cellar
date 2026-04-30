import { LogOut, Settings, User } from 'lucide-react';
import type { FeatureManifest, PaletteCommand } from '@cellar/shell-contract';
import { authClient } from './lib/auth-client';

const accountStaticCommands: PaletteCommand[] = [
  {
    id: 'account-goto-settings',
    label: 'Go to Settings',
    icon: Settings,
    group: 'Go To',
    kind: 'navigate',
    href: '/account/settings',
  },
  {
    id: 'account-sign-out',
    label: 'Sign out',
    icon: LogOut,
    group: 'Account',
    kind: 'action',
    action: async () => {
      await authClient.signOut();
      window.location.href = '/sign-in';
    },
  },
];

export const manifest: FeatureManifest = {
  id: 'account',
  label: 'Account',
  icon: User,
  basePath: '/account',
  rail: false,
  staticCommands: accountStaticCommands,
};

export default manifest;
