import { parseAsStringLiteral, useQueryState } from 'nuqs';

const VIEW_MODES = ['grid', 'list'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export function useViewMode() {
  return useQueryState('view', parseAsStringLiteral(VIEW_MODES).withDefault('grid'));
}
