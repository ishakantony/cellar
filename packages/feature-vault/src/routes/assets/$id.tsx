import { useState } from 'react';
import { Navigate, useParams } from 'react-router';
import { useAssetDrawer } from '../../hooks/use-asset-drawer';

/**
 * Thin route that opens the asset drawer for the given id and redirects to
 * the asset list. The drawer is a globally-mounted overlay; this route exists
 * so that `/vault/assets/:id` is a stable, link-friendly URL per the PRD.
 *
 * A future iteration may render the asset detail inline (without the overlay)
 * — for now we preserve the existing drawer-based UX.
 */
export function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const openView = useAssetDrawer.getState().openView;

  // Imperatively open the drawer the first time the page renders. Stored in
  // useState so React's StrictMode double-invocation doesn't fire it twice.
  useState(() => {
    if (id) openView(id);
    return null;
  });

  return <Navigate to="/vault/assets" replace />;
}
