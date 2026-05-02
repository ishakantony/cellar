import type { PaletteCommand } from '@cellar/shell-contract';

/**
 * Static palette commands that belong to the shell itself — not to any feature.
 * These commands are available in every feature context and should never carry
 * `scope: 'feature'`.
 *
 * Currently empty: the previous "Toggle sidebar" command was removed when the
 * sidebar became fixed-width and the rail was folded into it.
 */
export const shellStaticCommands: PaletteCommand[] = [];
