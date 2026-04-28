## Parent PRD

`issues/prd.md`

## What to build

Extend the existing dashboard API endpoint to return aggregate counts so the dashboard page can display a stats strip. The endpoint at `apps/api/src/routes/dashboard.ts` already returns `pinnedAssets`, `pinnedCollections`, and `recentAssets`. Add a `counts` field computed server-side.

Shape of the new field:

```
counts: {
  total: number           // total assets owned by the user
  byType: {               // count per AssetType enum value
    SNIPPET: number
    PROMPT: number
    NOTE: number
    LINK: number
    IMAGE: number
    FILE: number
  }
  pinnedCount: number     // total pinned assets
}
```

The counts are computed with a single GROUP BY query on the `asset` table filtered by the authenticated user. The `DashboardData` Zod schema in `packages/shared` is updated to include the `counts` field so the type flows end-to-end to the frontend via Hono RPC.

## Acceptance criteria

- [ ] `GET /api/dashboard` response includes a `counts` object with `total`, `byType`, and `pinnedCount`
- [ ] `byType` contains an entry for every `AssetType` enum value (zero counts included, not omitted)
- [ ] Counts are scoped to the authenticated user — no cross-user data leaks
- [ ] `DashboardData` schema in `packages/shared` reflects the new shape
- [ ] `useDashboardQuery()` return type includes `counts` without manual casting
- [ ] API integration test: seed known assets of multiple types, assert `counts.byType` matches

## Blocked by

None — can start immediately.

## User stories addressed

- User story 26
