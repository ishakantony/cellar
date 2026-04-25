## Problem Statement

The Cellar application has a fully implemented backend for asset management — Prisma schema, server actions for CRUD, search, file upload API, and collection associations — but the user-facing frontend pages for assets are non-functional. Both `/assets` (the asset listing) and `/dashboard` render "Coming Soon" placeholders. Users cannot create, browse, view, edit, or delete assets through the web interface, rendering the core vault functionality inaccessible despite all backend infrastructure being in place.

## Solution

Build the complete user-facing frontend for asset CRUD operations: a responsive asset listing page with search, filtering, sorting, and pagination; a creation page with a type-aware form; a read-only detail page with rich type-specific rendering and inline organization tools; and a dedicated edit page with unsaved-changes protection. All interactive state is synchronized to the URL for shareability and back-button resilience. The implementation leverages the existing server actions, validation schemas, UI primitives, and file upload infrastructure without duplicating backend logic.

## User Stories

1. As a user, I want to see all my assets in a grid or list view, so that I can quickly scan my vault.
2. As a user, I want to search my assets by typing keywords, so that I can find specific items instantly.
3. As a user, I want to filter assets by type (Snippet, Prompt, Note, Link, Image, File), so that I can focus on one category.
4. As a user, I want to sort assets by newest, oldest, A-Z, or Z-A, so that I can organize the view to my preference.
5. As a user, I want pinned assets to always appear at the top of the list, so that my most important items are immediately visible.
6. As a user, I want the search, filter, and sort state to persist in the URL, so that I can bookmark or share a specific view.
7. As a user, I want to load more assets incrementally instead of seeing everything at once, so that the page remains performant as my vault grows.
8. As a user, I want a skeleton loading state while assets are loading, so that the UI feels responsive.
9. As a user, I want a clear empty state message when I have no assets or no matching results, so that I know what to do next.
10. As a user, I want to create a new asset by choosing its type and filling a form, so that I can add items to my vault.
11. As a user, I want the creation form to show only the fields relevant to the selected asset type, so that I'm not overwhelmed by irrelevant inputs.
12. As a user, I want to write code snippets in an editor with syntax highlighting, so that the experience feels professional.
13. As a user, I want to write notes and prompts in a markdown editor with a live preview toggle, so that I can see how my content will look.
14. As a user, I want to upload images and files via drag-and-drop, so that adding file-based assets is effortless.
15. As a user, I want immediate feedback if a file upload fails, so that I can correct the issue without losing the rest of my form data.
16. As a user, I want to assign an asset to multiple collections during creation, so that I can organize it immediately.
17. As a user, I want to view an asset's detail page with rich rendering (syntax-highlighted code, rendered markdown, image preview, link card, file download), so that I can consume the content easily.
18. As a user, I want contextual quick actions on the detail page (copy code, open link, download file, view image full-size), so that I can interact with the asset content directly.
19. As a user, I want to add or remove an asset from collections directly on the detail page without entering edit mode, so that lightweight organization is fast.
20. As a user, I want to edit an asset by navigating to a dedicated edit page, so that I can make changes in a focused environment.
21. As a user, I want the edit form to warn me if I try to leave with unsaved changes, so that I don't accidentally lose my work.
22. As a user, I want to replace an uploaded image or file when editing, so that I can fix mistakes without deleting and recreating the asset.
23. As a user, I want the old file to be automatically cleaned up when I replace it, so that my storage doesn't accumulate garbage.
24. As a user, I want to pin or unpin an asset from the listing or detail page, so that I can mark important items.
25. As a user, I want pin/unpin to feel instant, so that the UI feels snappy.
26. As a user, I want to delete an asset with a confirmation dialog, so that I don't accidentally remove something important.
27. As a user, I want to be redirected back to the asset list after deleting an asset, so that I can continue managing my vault.
28. As a user, I want to be redirected to the asset detail page after creating or editing an asset, so that I can immediately review my changes.
29. As a user, I want the asset type to be immutable after creation, so that the data model remains semantically consistent.
30. As a developer, I want every new component to have Storybook stories with autodocs and interaction tests, so that the design system remains documented and regression-free.
31. As a developer, I want the Monaco editor to render a lightweight mock in Storybook instead of the full bundle, so that stories load quickly and reliably.

## Implementation Decisions

### Architecture Pattern

- Server Components fetch initial data and pass it to client shells. Client shells manage interactive state (search input, view toggle, pagination, optimistic updates).
- Query parameter state (`q`, `type`, `sort`) is synchronized to the URL using `nuqs`, enabling shareable links and server-side initial rendering.
- The asset list uses a hybrid pagination model: the backend supports `limit` and `offset`, and the UI shows a "Load more" button that appends results to local state.

### Backend Extension

- `UpdateAssetSchema` and the `updateAsset` server action are extended to accept optional file metadata fields (`filePath`, `fileName`, `mimeType`, `fileSize`).
- When `updateAsset` detects a changed `filePath`, it deletes the old file from disk (with path-traversal protection) before updating the database record.
- `getAssets` is extended with `limit` and `offset` parameters for pagination, and a secondary `pinned DESC` sort is applied before the user's chosen sort order.

### Component Modules

- **AssetForm**: A unified create/edit form component that conditionally renders fields based on the selected asset type. It accepts `defaultValues` and an `onSubmit` callback, making it reusable for both creation and editing. The type selector is disabled in edit mode.
- **AssetContentRenderer**: A router component that selects the appropriate renderer based on asset type. It encapsulates the mapping from type to visual representation and provides a stable interface for the detail page.
- **CollectionMultiSelect**: A reusable molecule for assigning assets to collections. It accepts an array of available collections, a selection array, and an `onChange` callback. It renders a searchable dropdown and removable chips.
- **FileUploadField**: Wraps the existing file dropzone with asset-specific chrome: image preview, formatted file metadata, React Hook Form integration, and a replace flow.
- **MarkdownEditor**: Combines Monaco Editor in markdown mode with a tabbed Edit/Preview interface. The preview pane uses the existing `react-markdown` pipeline.
- **AssetsClient**: The client shell for the listing page. It manages URL state (via `nuqs`), local asset list state (including "Load more" appending), optimistic pin toggling, and view mode toggling.
- **AssetDetailClient**: The client shell for the detail page. It manages the read-only view, inline collection management, delete confirmation, and contextual quick actions.

### Asset Type Rendering Strategy

- **Snippet**: Monaco Editor in read-only mode with the selected programming language for syntax highlighting. Includes a "Copy to clipboard" quick action.
- **Prompt / Note**: Rendered markdown via `react-markdown` with sanitization and GitHub-flavored markdown. The edit form uses the MarkdownEditor component.
- **Link**: A link preview card with a clickable URL and an "Open in new tab" quick action.
- **Image**: An image preview with a lightbox on click.
- **File**: File metadata display (name, size, type) with a download quick action.

### Loading States

- Initial page load displays a skeleton grid of placeholder cards matching the real card dimensions.
- The "Load more" button uses its own `loading` spinner state while keeping existing content visible.

### Optimistic UI

- Pin/unpin actions are applied optimistically in the client state while the server action fires in the background. Errors trigger a rollback and a toast notification.
- Delete actions are pessimistic (wait for server confirmation, then refetch or redirect) because they already require a confirmation dialog.

### Unsaved Changes Protection

- The edit form tracks dirty state via React Hook Form.
- A `beforeunload` handler blocks browser navigation (close/refresh) when dirty.
- A custom modal intercepts in-app navigation attempts (Next.js App Router does not provide a built-in Prompt component).

### Storybook Strategy

- Every molecule and organism component receives a CSF3 story file with `autodocs` enabled.
- Stories use `fn()` from `storybook/test` for action callbacks and `play` functions for interaction testing.
- Mock data is generated using the existing test-data factory, with inline overrides for story-specific edge cases.
- The Monaco Editor is conditionally rendered as a styled textarea in Storybook to avoid bundle size and rendering issues, while the real app uses the full editor.

## Testing Decisions

### What Makes a Good Test

- Tests verify external behavior and user-visible outcomes, not implementation details.
- Unit tests assert component rendering, user interactions, and callback invocation.
- Storybook interaction tests (`play` functions) verify that components respond correctly to clicks, typing, and state changes in a real browser environment.

### Modules to Test

- **AssetForm**: Unit tests for conditional field rendering per type, validation error display, and submission with correct payload shape.
- **CollectionMultiSelect**: Unit tests and interaction tests for selecting, removing, and searching collections.
- **FileUploadField**: Interaction tests for upload flow, error display, and replace behavior.
- **MarkdownEditor**: Interaction tests for the Edit/Preview tab toggle.
- **AssetContentRenderer**: Storybook stories with visual regression coverage for all six asset types.
- **AssetCardSkeleton**: Visual regression to ensure dimensions match the real card.
- **AssetsClient / AssetDetailClient**: E2E tests (Playwright) for full user flows — create, search, sort, pin, edit, delete.

### Prior Art

- Existing button, card, header, and collection-card stories demonstrate the CSF3 + autodocs + `play` function pattern.
- Existing co-located `.test.tsx` files demonstrate Vitest + Testing Library conventions.
- The existing `test-storybook` script and 80% coverage threshold are enforced in CI.

## Out of Scope

- Dashboard page wiring (remains "Coming Soon").
- Bulk operations on assets (multi-select delete, bulk move to collection).
- Asset sharing or public links.
- Asset versioning or revision history.
- Real-time collaborative editing.
- AI-assisted content generation or tagging.
- Mobile-specific optimizations beyond responsive grid/list layouts.
- Creating new collections from within the asset form (users must use the collections page).

## Further Notes

- One new dependency is required: `nuqs` (latest stable version) for type-safe URL query parameter state management.
- The existing `FileDropzone` component handles the core upload mechanics; it is wrapped rather than replaced.
- The existing `@monaco-editor/react` dependency already supports React 19 and is used for both code snippets and markdown editing.
- The existing `react-markdown`, `rehype-sanitize`, and `remark-gfm` dependencies power the markdown preview without additional packages.
- All new components follow the existing directory convention: domain-specific components live in `src/components/assets/`, while generic primitives remain in `src/components/ui/`.
- The project enforces co-location: every component ships with a `.stories.tsx` and a `.test.tsx` alongside its implementation.
