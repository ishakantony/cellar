import { Package } from 'lucide-react';
import type { FeatureManifest } from '@cellar/shell-contract';

/**
 * Eager Vault manifest. Real routes/nav/palette provider are filled in by
 * issue #003 when Vault is extracted out of the shell.
 */
export const manifest: FeatureManifest = {
  id: 'vault',
  label: 'Vault',
  icon: Package,
  basePath: '/vault',
  rail: true,
};

export default manifest;
