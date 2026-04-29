import { Wrench } from 'lucide-react';
import type { FeatureManifest } from '@cellar/shell-contract';

/**
 * Eager Toolbox manifest. Real tool routes (e.g. JSON Explorer) are added in
 * issues #004/#008.
 */
export const manifest: FeatureManifest = {
  id: 'toolbox',
  label: 'Toolbox',
  icon: Wrench,
  basePath: '/toolbox',
  rail: true,
};

export default manifest;
