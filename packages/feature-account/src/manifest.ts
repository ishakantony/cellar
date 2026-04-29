import { User } from 'lucide-react';
import type { FeatureManifest } from '@cellar/shell-contract';

/**
 * Eager Account manifest. `rail: false` — Account is reachable by URL but
 * does not show up in the rail. Real routes/nav are added in issue #008.
 */
export const manifest: FeatureManifest = {
  id: 'account',
  label: 'Account',
  icon: User,
  basePath: '/account',
  rail: false,
};

export default manifest;
