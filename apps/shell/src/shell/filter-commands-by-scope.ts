import type { PaletteCommand } from '@cellar/shell-contract';

/**
 * Pure function that filters a list of palette commands by visibility scope.
 *
 * Rules:
 * - Commands with no `scope` or `scope: 'global'` are always included.
 * - Commands with `scope: 'feature'` are included only when `activeFeatureId`
 *   is non-null **and** equals the command's `featureId`.
 * - When `activeFeatureId` is `null` (e.g. transitional route state), all
 *   feature-scoped commands are hidden.
 *
 * @param commands     The full list of static palette commands.
 * @param activeFeatureId  The id of the currently active feature (from the
 *                         URL) or `null` if none is active.
 * @returns The filtered subset that should be shown to the user.
 */
export function filterCommandsByScope(
  commands: PaletteCommand[],
  activeFeatureId: string | null
): PaletteCommand[] {
  return commands.filter(cmd => {
    if (!cmd.scope || cmd.scope === 'global') {
      return true;
    }
    // scope === 'feature'
    if (activeFeatureId === null) {
      return false;
    }
    return cmd.featureId === activeFeatureId;
  });
}
