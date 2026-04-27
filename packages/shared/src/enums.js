import { z } from 'zod';
export const ASSET_TYPES = ['SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE'];
export const assetTypeSchema = z.enum(ASSET_TYPES);
export const AssetType = {
  SNIPPET: 'SNIPPET',
  PROMPT: 'PROMPT',
  NOTE: 'NOTE',
  LINK: 'LINK',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
};
//# sourceMappingURL=enums.js.map
