# PRD — Cellar Super-App Architecture & Toolbox JSON Explorer (v1)

## Problem Statement

Cellar today is a single-purpose product (Vault) built as a single SPA in `apps/web`. The intent has always been bigger — Cellar is meant to be a **super app** hosting many features, with more teams onboarding their own features over time and an eventual move to module federation when the feature count and team independence demand it.

The current codebase doesn't reflect that vision:

- The web app is named `apps/web` and treats Vault as the whole product. Routes (`/dashboard`, `/assets`, `/collections`, `/settings`) live flat at the root with no notion of feature ownership.
- `Settings` is implemented as if it were a Vault concern even though it's an account-level concern that any future feature will share.
- The sidebar hardcodes Vault sections (`General`, `Assets`); a Vault-specific filter convention (`?type=…`) leaks into shared layout code.
- The command palette — meant to be the super-app's universal entry point — is also Vault-coupled, importing Vault-specific data hooks and modal stores directly.
- There are no boundaries to prevent a second feature from importing Vault internals when it lands, nor any rail/switcher pattern to make multiple features feel like one cohesive product.

Adding a second feature ("Toolbox") on top of this codebase as-is would either tangle Vault and Toolbox internals together, or force a messy retrofit later when the third or fourth feature lands. The architectural investment must happen now, before "Toolbox" is anything more than a placeholder.

Concretely, the user wants to start building Toolbox by shipping its first tool: a **JSON Explorer**. Engineers (the primary Cellar audience) regularly need to inspect API responses, navigate nested structures, and grab values or paths from JSON they paste in. They want to do that inside Cellar rather than reaching for a third-party tool.

## Solution

Reshape Cellar's frontend into a super-app shell that hosts independently-developed feature packages, then build Toolbox's JSON Explorer as the first feature delivered under the new architecture.

**From the user's perspective:**

- Logging in lands them on the feature they used last. New users default to Vault.
- A thin icon rail on the far left switches between features (Vault, Toolbox). Hovering reveals a label tooltip; pinning expands the rail to show labels permanently.
- Each feature owns its own sidebar — when the user is in Vault they see Vault navigation; when they switch to Toolbox they see Toolbox navigation. The active feature owns its surface.
- A single global command palette opens with `⌘K` from anywhere and searches across every feature in one place: assets, collections, tools, account settings, navigation actions. There's no "Vault palette vs Toolbox palette" — one palette, one shortcut, results grouped by feature.
- `/` focuses the search box on the current page (when there is one) for in-page filtering.
- `⌘B` toggles the feature sidebar so the user can hide it for focus, with the shortcut suppressed when typing in editors.
- The user menu (top-right avatar) holds Settings and Sign out. Account/Settings is no longer a Vault concern.
- Toolbox's first tool, JSON Explorer, lets the user paste or drop a JSON document and instantly see it as a navigable tree alongside the original text. They can search the tree, copy any value's path or content, format/minify the source, and recover from invalid JSON with a clear error pointer.

**Behind the surface:**

- Each feature lives in its own workspace package (`packages/feature-vault`, `packages/feature-toolbox`, `packages/feature-account`) with strict isolation enforced by package boundaries — features cannot import each other, only the shell composes them.
- Features are loaded lazily; only the active feature's code is shipped to the browser on first load.
- The shell-feature contract is small and additive: an eager **manifest** (rail metadata, static palette commands) and a lazy **module** (routes, nav contributions, optional palette search provider).
- The setup makes a future move to module federation a transport change, not a rewrite — features are already independently buildable units with no cross-feature compile-time dependencies.

## User Stories

### Cellar — super-app shell

1. As a Cellar user, I want logging in to land me on the feature I last used, so that I can resume work without extra navigation.
2. As a new Cellar user, I want logging in for the first time to land me on Vault, so that I have an obvious starting point.
3. As a Cellar user, I want to see a left-side rail with an icon for each feature, so that I can identify which features are available without opening menus.
4. As a Cellar user, I want hovering a rail icon to show the feature's name as a tooltip, so that I can identify icons I haven't memorized.
5. As a Cellar user, I want to pin the rail to a wider variant that always shows feature labels, so that I don't have to rely on hover when I'm still learning the icons.
6. As a Cellar user, I want my rail pinning preference to persist across sessions, so that I don't have to re-pin it every visit.
7. As a Cellar user, I want clicking a rail icon to switch to that feature, so that I can move between features quickly.
8. As a Cellar user, I want each feature to have its own sidebar contents when I'm inside it, so that the navigation stays relevant to what I'm doing.
9. As a Cellar user, I want to toggle the feature sidebar with `⌘B`, so that I can hide it for focus when I need more horizontal space.
10. As a Cellar user, I want `⌘B` to be ignored while I'm typing in a code or text editor, so that it doesn't conflict with editor commands like bold.
11. As a Cellar user, I want the rail to remain visible even when the feature sidebar is hidden, so that I can still switch features without un-hiding navigation.
12. As a Cellar user, I want the URL to clearly indicate which feature owns a page (`/vault/assets` vs `/toolbox/json-explorer`), so that bookmarks and shared links are unambiguous.
13. As a Cellar user, I want to access my profile and password settings from a user menu in the top-right, so that account concerns are separated from feature navigation.
14. As a Cellar user, I want the user menu to show my name and email at the top, so that I can confirm which account I'm in.
15. As a Cellar user, I want the user menu to offer Settings and Sign out, so that the most common account actions are one click away.
16. As a Cellar user, I want clicking outside the user menu to close it, so that it behaves like a standard dropdown.
17. As a Cellar user, I want feature switching to feel instant after the first visit, so that the multi-feature experience doesn't feel sluggish.
18. As a Cellar user, I want a feature that fails to load to show a clear error in the main content area with a retry button, so that I'm not stuck on a blank screen.
19. As a Cellar user, I want the rail to remain usable when one feature has failed to load, so that I can switch elsewhere instead of being trapped.
20. As a Cellar user, I want a skeleton placeholder while a feature is loading, so that I see immediate feedback instead of a blank pane.
21. As a Cellar user, I want the Cellar logo or mark visible at the top of the rail, so that the product branding is present without taking header space.

### Cellar — global command palette

22. As a Cellar user, I want to open a global command palette with `⌘K`, so that I have a universal way to search and act anywhere in the app.
23. As a Cellar user, I want the empty palette (no query) to show recent items, quick actions, feature switchers, and account links, so that it's useful even before I type.
24. As a Cellar user, I want typing to search across all features in parallel, so that I can find anything in Cellar from one place.
25. As a Cellar user, I want palette results grouped by feature, so that I understand which feature each result belongs to.
26. As a Cellar user, I want each result group to show its loading state independently, so that fast features (like Account) appear immediately even if Vault search is still resolving.
27. As a Cellar user, I want the palette to remember (pre-warm) loaded feature search providers within a session, so that repeat opens are instant.
28. As a Cellar user, I want hitting `Enter` on a result to navigate to it or run its action, so that I don't need to click.
29. As a Cellar user, I want `Esc` to close the palette and return focus to where I was, so that I don't lose context.
30. As a Cellar user, I want navigation entries (e.g. "Go to assets") to be searchable in the palette even before that feature has loaded, so that I can navigate without waiting.
31. As a Cellar user, I want quick actions like "New snippet" or "New collection" available in the palette, so that creation flows are reachable from anywhere.
32. As a Cellar user, I want the global palette to be opened by `⌘K` and the in-page search by `/`, so that I have two clear scopes — search-everywhere and filter-this-page.
33. As a Cellar user, I want `/` to focus the in-page search input on list pages that have one, so that I can quickly filter the current view without reaching for the mouse.

### Vault (preserved behavior under new architecture)

34. As a Vault user, I want my existing dashboard, assets, collections, and asset detail pages to keep working exactly as before, so that the architectural reshuffle is invisible to my day-to-day flow.
35. As a Vault user, I want all my Vault URLs to live under `/vault/*`, so that the routing reflects the feature boundary clearly.
36. As a Vault user, I want the asset type filter (currently surfaced as a sidebar entry per type) to live as in-page filter tabs on the assets list, so that filters belong to the page rather than to global navigation.
37. As a Vault user, I want my existing asset and collection search functionality to remain available — surfaced through the global palette and via in-page search inputs.
38. As a Vault user, I want pinned assets and collections to keep appearing on the Vault home page (the page that was previously `/dashboard`), so that my pinned items remain discoverable.

### Toolbox

39. As a Toolbox user, I want a Toolbox icon in the rail, so that I can switch into it just like Vault.
40. As a Toolbox user, I want clicking the Toolbox icon to take me directly to the only available tool in v1 (JSON Explorer), so that I'm not stopped at an empty launcher page.
41. As a Toolbox user, I want each tool in Toolbox to be its own page reachable at `/toolbox/<tool-name>`, so that I can deep-link or bookmark a specific tool.

### JSON Explorer

42. As an engineer, I want to paste JSON into a code editor on the left side of the JSON Explorer, so that I can immediately work with API responses or fixtures.
43. As an engineer, I want to drag-and-drop a `.json` file onto the editor, so that I don't have to copy from a downloaded file by hand.
44. As an engineer, I want the editor to show JSON syntax highlighting, so that the source is readable while I edit.
45. As an engineer, I want a Format button that pretty-prints the JSON in place, so that I can clean up minified payloads.
46. As an engineer, I want a Minify button that strips whitespace, so that I can produce a compact form to copy.
47. As an engineer, I want a Copy button that copies the editor's current contents to my clipboard, so that I can paste a cleaned version elsewhere.
48. As an engineer, I want the parsed JSON to render as a collapsible tree on the right side, so that I can navigate nested structures without scrolling raw text.
49. As an engineer, I want each tree row to show the key, value (truncated when long), type indicator, and a count badge for arrays/objects, so that I can scan structure at a glance.
50. As an engineer, I want expand/collapse carets on rows that have children, so that I can drill in or out at any level.
51. As an engineer, I want hovering a tree row to reveal a "copy path" icon, so that I can grab the JSONPath to that node with one click.
52. As an engineer, I want hovering a tree row to also reveal a "copy value" icon, so that I can grab the value (formatted) without selecting text.
53. As an engineer, I want right-clicking a tree row to open a context menu with copy options, so that power users have a faster path than hover.
54. As an engineer, I want a search box on the tree that filters to matching subtrees with their parent context, so that I can quickly find a key or value in a large document.
55. As an engineer, I want search to match both keys and values, so that I don't need to remember which side a term lives on.
56. As an engineer, I want invalid JSON to show a clear error message in the right pane with the line and column of the problem, so that I know exactly what's wrong.
57. As an engineer, I want invalid JSON to also show a marker in the editor's gutter at the offending line, so that I can locate the issue while editing.
58. As an engineer, I want to drag the divider between the editor and tree panes to resize them, so that I can give more space to whichever side I'm focused on.
59. As an engineer, I want my preferred pane ratio to persist across sessions, so that I don't have to resize every time.
60. As an engineer, I want to land on an empty editor with a "Paste JSON to begin…" placeholder, so that the tool is immediately usable without tutorials.
61. As an engineer, I want pasting/typing JSON to update the tree live, so that I see the result of edits without manual refresh.
62. As an engineer, I want refreshing the page to clear the JSON Explorer, so that I'm not surprised by stale data — every session is fresh.
63. As an engineer, I want a soft warning banner if I paste a JSON document larger than ~5 MB, so that I'm not blindsided by sluggish performance.
64. As an engineer, I want JSON above ~50 MB to be rejected with a message recommending I split the document, so that the tool fails predictably rather than hanging.
65. As an engineer, I want the in-page search box to be focusable with `/`, so that I can search the tree without reaching for the mouse.

## Implementation Decisions

### Architecture-level

- **Workspace layout (L2).** The frontend is split into one shell host (`apps/shell`, renamed from `apps/web`) and three feature packages: `packages/feature-vault`, `packages/feature-toolbox`, `packages/feature-account`. The Hono backend stays as `apps/api`. Existing `packages/shared` and `packages/ui` stay; some shared components graduate from the shell into `packages/ui`.
- **Strict feature isolation (Dep1).** Features cannot import each other. Cross-feature integration goes through the API or `@cellar/shared` types. Boundaries are enforced mechanically by the workspace-package resolver (a feature's index file is the only public surface).
- **Lazy feature loading (E2).** Each feature is dynamically imported. Initial bundle = shell only. The pattern is set uniformly for all features now so the same shape carries through to twenty features.
- **Manifest/module split.** Each feature exposes two entry points:
  - **Manifest** (eager, tiny): `id`, `label`, `icon`, `basePath`, optional `staticCommands`, optional `Skeleton`. Imported directly by the shell.
  - **Module** (lazy, default export): `routes`, `nav`, optional `paletteProvider`. Loaded on demand.
- **Forward compatibility with module federation.** The manifest/module shape, lazy loading, and strict isolation already match what an MFE remote needs. Switching to MFE later is adding the federation plugin and marking shared deps singleton — no code rewrite.
- **No global "Cellar home" page (D1a).** `/` redirects to the user's last-active feature; new users default to `/vault`. Cross-feature browsing happens through the rail and the global palette.
- **Feature-namespaced URLs (D2a).** All routes namespace under their feature: `/vault/*`, `/toolbox/*`, `/account/*`. No back-compat redirects — old root-level paths (`/dashboard`, `/assets`, `/collections`, `/settings`) are removed because Cellar has no external bookmark obligation yet.
- **Backend stays monolithic with internal namespacing (B1).** Hono routes reorganized into `/api/vault/*`, `/api/account/*`, `/api/toolbox/*` folders mounted from `apps/api`. The `AppType` export still flows through a single Hono builder so RPC types continue to infer end-to-end. Splitting backend into per-feature packages is deferred until a team owns a feature's backend independently.
- **Schema sliced (S2).** `apps/api/src/db/schema.ts` becomes a folder of slices (`auth.ts`, `oauth.ts`, `vault.ts`) plus a barrel `index.ts` that re-exports tables and the unified Drizzle `schema` object. Auth and OAuth tables are infrastructure (Better Auth + OAuth provider), not features. Drizzle migrations are unchanged.

### Information architecture

- **App switcher rail.** Far-left vertical icon strip, ~56px wide by default. Top slot holds the Cellar mark. Below it, one icon per feature that should appear in the rail (Vault, Toolbox). Account is **not** in the rail — it's reachable via the user menu only.
- **Pinnable wide rail.** A pin/expand toggle at the bottom of the rail switches it to a ~180px wide variant that shows feature labels next to icons. Pinning preference persists across sessions in localStorage.
- **Hover tooltip.** When the rail is in icon-only mode, hovering a feature icon shows its label as a floating tooltip (Radix tooltip or equivalent) that does not push layout.
- **Per-feature sidebar.** The active feature's `nav` array drives a sidebar to the right of the rail. The sidebar is owned by the feature; the shell only provides the chrome.
- **Header.** Shell-owned. Left zone: mobile menu toggle + sidebar collapse toggle. Center zone: command-palette trigger (search-pill on desktop, magnifier on mobile). Right zone: user-menu avatar with dropdown.
- **No header logo.** The Cellar mark lives in the rail's top slot only.
- **No notifications icon.** Reserved space is not added; this can be revisited if/when notifications become a real feature.
- **No feature contributions to the header.** Per-page actions (e.g., "Add Collection") move from a header-actions area into the page body where they belong.
- **Sidebar footer is removed.** The user menu, currently in the sidebar footer, moves to the header. The feature sidebar is fully feature-owned with no shell-controlled bottom area.

### Loading and error semantics

- **Optimistic chrome (LE3).** Rail and feature-sidebar header render immediately from the eager manifest. Feature module loads in parallel; while loading, the sidebar nav and main content show skeletons.
- **Shell-owned feature error boundary.** Each feature's route subtree is wrapped in an error boundary at the route composer. If the feature fails to load (network, version mismatch, runtime error during load), an inline error card with a retry button appears in the main content area. The rail and account chrome remain functional so the user can switch elsewhere.
- **Per-feature optional skeleton.** A feature can supply a `Skeleton` component in its manifest for tailored loading content; otherwise the shell renders a generic skeleton.

### Feature contract

- **Manifest shape (eager):** `{ id, label, icon, basePath, staticCommands?, Skeleton? }`. `staticCommands` is an optional array of `{ id, label, icon, group, kind: 'navigate'|'action', href? }` entries that appear in the global palette without requiring the feature module to load. They drive navigation or trigger actions handled inside the feature once it loads.
- **Module shape (lazy default export):** `{ routes, nav, paletteProvider? }`. `routes` is a React-Router `RouteObject[]` rooted under the feature's `basePath`; route children may use React Router's `lazy` for further granularity. `nav` is the array of sidebar entries the active feature contributes. `paletteProvider` is an optional object exposing a `search(query, signal): Promise<PaletteItem[]>` method (and optionally `getRecent(): Promise<PaletteItem[]>`) used by the global palette aggregator.
- **Single feature registry.** `apps/shell` holds one place that imports each feature's manifest eagerly and binds a lazy `load` function for each module. This is the only spot that lists all features.

### Global command palette (P2)

- **Shell-owned UI, feature-contributed content.** The palette UI lives in `apps/shell`. The shell aggregates `staticCommands` from every manifest (always available) and dispatches `paletteProvider.search` calls in parallel to all loaded modules.
- **Pre-warming.** On first palette open, the shell initiates a parallel prefetch of all feature modules. Static commands are immediately interactive; live results stream in per group as each provider resolves. Subsequent opens are instant.
- **Per-group loading and error containment.** Each feature group in the palette renders its own loading skeleton or error state independently. A failed provider does not block other groups.
- **Result grouping.** Results are grouped by feature in the order: active feature first, then other features alphabetically, then global navigation/account groups.
- **Empty state.** When the input is empty, the palette shows recent items (per feature, where supported), quick actions (from manifests), feature switchers, and account links (Settings, Sign out).
- **Existing palette code migrates into Vault.** The current rich palette in `apps/web/src/components/command-palette/command-palette.tsx`, the supporting hooks in `hooks/use-command-palette*`, and `lib/command-palette-results.ts` / `lib/command-palette-actions.ts` are reorganized: the UI shell moves to `apps/shell`, and the data hooks + result builders move into `packages/feature-vault` as the implementation of Vault's `paletteProvider` and `staticCommands`.

### Keyboard shortcuts

- **`⌘K` / `Ctrl+K`** — open the global palette. Shell-owned.
- **`⌘B` / `Ctrl+B`** — toggle the feature sidebar. Shell-owned, with a focus-aware suppression predicate that bails when the focus is inside a CodeMirror editor, contenteditable, `input`, or `textarea`. Rail is never affected by `⌘B`.
- **`/`** — focus the active page's in-page search input when one exists. Page-owned binding (registered while the page is mounted); the shell does not coordinate it.
- **`Esc`** — close palette / dropdowns; restore focus to the previously-focused element.

### State persistence

- **Last-active feature.** Persisted in localStorage; read at app boot to determine the redirect target for `/`. Default `/vault` when missing.
- **Rail pin (icon-only vs wide).** Persisted in localStorage.
- **Sidebar collapse.** Persisted in localStorage.
- **Split-pane ratio (JSON Explorer).** Persisted in localStorage.
- **No persistence for JSON Explorer document content** — refresh clears the editor.

### Vault adjustments

- **Vault home page.** What was `/dashboard` becomes the `/vault` index — same content (quick capture, pinned assets/collections, recents).
- **In-page asset filter.** The current sidebar `?type=…` filter convention moves out of the global sidebar into in-page filter tabs on `/vault/assets`. The shared layout component is cleaned of the Vault-specific special case.
- **Vault contributes to the global palette.** Vault's manifest contains `staticCommands` for navigation entries (Go to assets / collections / dashboard) and quick actions (New snippet, New collection, etc.). Vault's lazy module exports a `paletteProvider` that searches assets and collections (via the existing `/api/vault/assets` and `/api/vault/collections` endpoints).

### Account adjustments

- **Account is a feature with no rail entry.** Its manifest includes the routes (`/account/settings`, future `/account/profile`) and minimal nav (none in v1). The user menu in the header links to `/account/settings`.
- **No account-specific tables.** The Account feature consumes the existing `user` table (Better Auth-owned) for profile and password change. New tables are not introduced by this PRD.

### Toolbox adjustments

- **Single tool in v1 (Tb1).** `/toolbox` redirects to `/toolbox/json-explorer`. No launcher page is built until a second tool exists.
- **Toolbox manifest contributes to palette.** Static commands include "Open JSON Explorer" (navigation) and any quick actions the JSON Explorer needs (e.g., "New JSON paste" — though in v1 there is only one tool so this is essentially a redirect).
- **No backend tables for Toolbox in v1.** JSON Explorer is fully client-side; no server endpoints needed under `/api/toolbox/*` yet.

### JSON Explorer (Toolbox v1's first tool)

- **Goal: inspect and debug.** The tool is a JSON viewer/explorer. Transformation, diffing, validation, schema generation, graph visualization are explicitly out of scope for v1 (see Out of Scope).
- **Layout: split pane.** Editor on the left, tree on the right. A draggable divider resizes the panes; the ratio persists in localStorage. Default ~40/60 (editor smaller).
- **Right pane reserves a tab strip.** v1 only renders a `[Tree]` tab; future additions like `[Stats]` slot in without rework.
- **Editor.** Reuses the shared `@cellar/ui` CodeMirror component (graduated from `apps/web/src/components/common/codemirror-editor.tsx`) with `@codemirror/lang-json`. Editor is not auto-formatted on input — a Format button at the top pretty-prints in place. A Minify button strips whitespace. A Copy button copies the current editor contents.
- **Drag-and-drop input.** Native HTML5 drag-and-drop on the editor pane accepts `.json` files and replaces the editor contents. No additional library dependency.
- **Tree.** Each row shows: disclosure caret if expandable, key, type badge (`# str`, `# num`, `# bool`, `# null`, `[]`, `{}`), truncated value (long strings collapsed to a hover/click expand), and a count badge for arrays/objects (`[N]`, `{N}`).
- **Tree interactions.** Hovering a row reveals copy-path and copy-value icon buttons on the right edge. Right-clicking a row opens a context menu with the same copy options. Both interactions invoke the same underlying handlers.
- **Search.** A search input above the tree filters the tree to matching subtrees with their full parent path retained for context. Search matches both keys and values; non-matching siblings are hidden. Empty query restores the full tree.
- **Invalid JSON.** Parse errors render in the right pane as an error card containing the parser's message plus the offending line and column. The editor's lint gutter also displays a marker at the same line. Empty buffer is treated as empty (placeholder), not invalid.
- **Empty state.** The editor shows a "Paste JSON to begin…" placeholder; the right pane mirrors with its own placeholder. No sample documents.
- **Size handling.** Soft warning banner at ~5 MB ("Large document — tree may be slow"). Hard refusal above ~50 MB with a recommendation to split. No streaming or virtualization in v1.
- **Ephemeral.** Refresh clears the editor; no persistence of pasted content. No URL fetch and no file persistence.
- **Path utility.** A pure JSONPath builder is used for copy-path and is unit-testable in isolation.

## Testing Decisions

### What makes a good test (in this codebase)

- Tests assert externally-observable behavior, not implementation details. They drive components through the public API a real consumer would use (rendered output, hooks called by a test harness, exported pure functions invoked directly).
- Pure deep modules (manifest aggregation, route composition, parsers, search filters, path utilities) get focused unit tests with a wide range of input shapes. These are the highest-value tests because the behavior is stable but the surface around them changes often.
- UI components are exercised primarily through Storybook stories plus integration-style tests using Testing Library to drive user interactions (click, type, keyboard) and assert on visible output. Implementation details like internal state names or component hierarchy are not asserted.
- API route tests use the Hono test client against a real database (per the project's existing test setup) — mocking the database is explicitly avoided.

### Modules to test in v1

Strong unit-test coverage (deep modules):

- **Feature registry** — boot-time initialization, manifest validation, lazy `load` invocation patterns.
- **Route composer** — given a feature list, produces the expected RouteObject tree, error boundaries are placed correctly, namespacing is honored, lazy children are wired.
- **Palette aggregator** — given query + registry, returns grouped results from all providers in parallel, propagates abort signals, contains errors per provider, surfaces static commands immediately.
- **Feature loader** — retry behavior, skeleton-then-content sequence, error containment.
- **Last-active-feature store** — read/write to localStorage, fallback to default when missing or invalid, behavior on storage events.
- **Keyboard shortcut suppression predicate** — pure function: returns `true` when focus is in CodeMirror, contenteditable, `input`, `textarea`; `false` otherwise.
- **Split-pane component** — drag-resize within bounds, persistence behavior, mobile fallback to stacked.
- **JSON parser wrapper** — `parse(input) → { ok, value }` or `{ ok: false, line, col, message }`. Verify line/col extraction across browser-engine error formats; valid, invalid, and empty inputs.
- **Path utility** — JSONPath for objects, arrays, mixed nesting, special-character keys.
- **Search filter** — "filter to matching subtrees with parent context" semantics: no match, root match, nested match, array match, key-only match, value-only match, deeply nested match.
- **Tree view** — render-test the expand/collapse behavior, copy-icon hover reveal, right-click context menu, search-applied filtering UI.

Lower-priority (UI composition, covered by Storybook + visual review):

- App switcher rail, header, user menu, feature sidebar host, palette UI shell, command trigger, JSON Explorer top-level page wiring.

Integration/regression checks:

- One end-to-end test confirming Vault still works after extraction (load `/vault`, see the home, navigate to `/vault/assets`, see the list).
- One end-to-end test for JSON Explorer happy path (load `/toolbox/json-explorer`, paste a JSON sample, see tree, search, copy a path).
- One end-to-end test for the palette: open with `⌘K`, type a query, see results from multiple feature groups.

### Prior art in the repo

- `apps/web/src/components/layout/header-sidebar.test.tsx` — layout component test pattern.
- `apps/web/src/routes/dashboard.test.tsx` — page-level test pattern.
- `apps/api/src/routes/dashboard.test.ts` — API route test against a real database.
- `apps/web/src/components/common/codemirror-editor.test.tsx` — editor wrapper tests (relevant when graduating CodeMirror to `@cellar/ui`).
- `playwright/` and `e2e/` — existing Playwright setup is used for the new integration checks.

## Out of Scope

- **Module federation / per-feature independent deploys.** The architecture is designed to make this an additive transport change later; v1 ships a single bundled app with lazy chunks.
- **Per-feature backend packages.** The API stays monolithic in `apps/api` with internal namespacing. Splitting into per-feature server packages is deferred until ownership-by-team requires it.
- **Account features beyond the current settings.** Profile editing and password change continue to work as today, just relocated under `/account`. Email verification flows, two-factor, OAuth-provider self-service UI, etc., are not introduced here.
- **Authorization model for features.** All authenticated users can access all features. Per-feature roles, feature flags, or admin-only features are deferred.
- **Per-feature theming / accent colors.** A single shared visual identity is used for v1.
- **Notifications.** No notification icon, no notification surface in the header, no notification center.
- **Toolbox launcher page.** Until a second tool exists, `/toolbox` redirects directly to JSON Explorer.
- **Additional Toolbox tools.** Only JSON Explorer is built in v1. Subsequent tools are subsequent PRDs.
- **JSON Explorer — transformations.** JSON → TypeScript, JSON → Zod schema, JSON → YAML, JSON → CSV, etc.
- **JSON Explorer — diff.** Comparing two JSON documents.
- **JSON Explorer — schema validation.** Validating against JSON Schema, OpenAPI, etc.
- **JSON Explorer — graph view.** No jsoncrack-style relationship visualization.
- **JSON Explorer — fetch from URL.** No remote-URL input; only paste/type and file drop.
- **JSON Explorer — persistence.** No saving documents (server or local), no recent-pastes list, no shareable links.
- **JSON Explorer — collaborative or multi-document editing.** Single document, single session.
- **JSON Explorer — syntax-aware autocomplete or schema-driven editing.**
- **JSON Explorer — virtualization or streaming for very large documents.** Hard size limit instead.
- **`⌘⇧B` to toggle the rail.** Considered but deferred until users request rail-hiding.
- **Additional palette features.** Recent search history, fuzzy ranking improvements, preview pane for selected results — all v2 territory.
- **Vault search keyboard shortcut beyond `/`.** No additional Vault-only shortcut.
- **Back-compat redirects from old root paths.** Old `/dashboard`, `/assets`, `/collections`, `/settings` URLs are removed; bookmarks need updating.

## Further Notes

### Side effects of the migration that need explicit attention

- **Existing CodeMirror editor graduates to `@cellar/ui`.** It's currently in `apps/web/src/components/common/`. Vault's snippet and markdown editors plus the Toolbox JSON Explorer all need it; a shared package is the right home. Existing tests come along.
- **Existing rich command palette belongs to Vault, not the shell.** The hooks (`use-command-palette*`), result builders (`command-palette-results.ts`), and action registry (`command-palette-actions.ts`) move into `packages/feature-vault`. The cmdk UI shell stays in `apps/shell` but consumes content via the new contract instead of importing Vault internals directly.
- **Sidebar footer is removed.** The user menu currently in the sidebar footer relocates to the header right side.
- **Vault-specific filter logic in `nav-section.tsx` is removed.** The `?type=…` special case becomes in-page UI on the assets list.
- **`AppType` Hono RPC export.** The API's typed routes still export a single composed `AppType`. Care is needed during the route reorganization to keep that single chained Hono builder intact so RPC type inference continues to work end-to-end. Frontend `hc<AppType>()` call sites update to the new namespaced URLs (`/api/vault/...`, `/api/account/...`).
- **Drizzle schema barrel.** Drizzle migrations operate over the unified `schema` object exported from the barrel; the slicing must preserve that single source of truth.

### MFE migration path (for context, not for v1)

The architecture is purposefully shaped to make a future move to module federation a transport change rather than a rewrite:

- Each feature is already an independently buildable workspace package.
- Cross-feature compile-time dependencies are forbidden by Dep1.
- The eager manifest / lazy module split mirrors the manifest / remote shape MFE expects.
- Shared dependencies (React, TanStack Query, Better Auth client, `@cellar/ui`, `@cellar/shared`) are already centralized and can be marked singleton in MFE config.
- The bar to actually migrate is independent deploy cadence — when a team explicitly cannot ship on the shared release train.

### Open product questions deferred (to revisit when motivated)

- Per-feature accent colors / theming.
- Authorization (feature-level roles or feature flags).
- Notifications surface.
- A second Toolbox tool — concept TBD; the launcher page is built when that tool is committed to.
- JSON Explorer v2 directions (transforms, diff, schema validation, schema generation).
