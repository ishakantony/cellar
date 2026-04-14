# Cellar — Design Spec

A multi-user developer vault for storing snippets, notes, prompts, images, files, and links. Each user gets an isolated workspace. Local Postgres via Docker, Prisma 7 ORM, Better Auth for authentication.

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4, Lucide React icons, Inter + JetBrains Mono fonts
- **Database:** PostgreSQL 17 (Docker), Prisma 7
- **Auth:** Better Auth (email/password + GitHub OAuth)
- **Editor:** Monaco Editor via @monaco-editor/react (lazy-loaded)
- **Markdown:** react-markdown + remark-gfm for note/prompt preview
- **File storage:** Local filesystem (`uploads/{userId}/{uuid}.ext`)

## Data Model

### Asset (single table, type discriminator)

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User.id |
| type | Enum | SNIPPET, PROMPT, NOTE, LINK, IMAGE, FILE |
| title | String | Required |
| description | String? | Optional |
| pinned | Boolean | Default false |
| content | String? | Text body for SNIPPET, PROMPT, NOTE |
| language | String? | Programming language for SNIPPET |
| url | String? | URL for LINK |
| filePath | String? | Disk path for IMAGE, FILE |
| fileName | String? | Original filename for IMAGE, FILE |
| mimeType | String? | MIME type for IMAGE, FILE |
| fileSize | Int? | Bytes for IMAGE, FILE |
| searchVector | tsvector | Generated from title (A) + content (B) + description (C) |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

GIN index on `searchVector`. All queries scoped by `userId`.

### Collection

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User.id |
| name | String | Required |
| description | String? | Optional |
| color | String? | Hex color for UI icon tint |
| pinned | Boolean | Default false |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### AssetCollection (join table)

| Field | Type | Notes |
|-------|------|-------|
| assetId | String | FK → Asset.id |
| collectionId | String | FK → Collection.id |

Composite PK on (assetId, collectionId). Many-to-many: an asset can belong to multiple collections.

### User + Better Auth tables

Better Auth manages `user`, `session`, `account`, and `verification` tables via its Prisma adapter. The `user` table has: id, name, email, emailVerified, image, createdAt, updatedAt.

## Routes

### Auth (route group: `(auth)`)

Minimal centered layout, dark theme, Cellar branding.

- `/sign-in` — email/password form + "Sign in with GitHub" button, link to sign-up
- `/sign-up` — name + email + password form + GitHub OAuth, link to sign-in

### App (route group: `(app)`)

Sidebar + header shell layout. Auth-protected via middleware.

- `/dashboard` — quick actions (6 create buttons), pinned assets list, pinned collections grid, recent assets (last 10 by updatedAt)
- `/assets` — all items list with type filter tabs (All | Snippets | Prompts | Links | Notes | Images | Files), sort by date or name. Sidebar type links go here with `?type=` query param.
- `/collections` — grid of collection cards (name, color, item count, pin toggle, create button)
- `/collections/[id]` — collection detail showing its assets in list rows
- `/settings` — profile (name, avatar) and account (password, connected GitHub)

### API

- `/api/auth/[...all]` — Better Auth catch-all handler
- `/api/upload` — POST multipart file upload, streams to `uploads/{userId}/{uuid}.ext`
- `/api/files/[...path]` — auth-checked file serving route

## Asset Creation

Quick action buttons on the dashboard and the "Add Item" button in the header both open the same asset drawer in **create mode**. The drawer pre-selects the asset type (if triggered from a quick action button) or defaults to SNIPPET (if triggered from "Add Item"). The user fills in the title and type-specific fields, then saves. For IMAGE/FILE types, a file input replaces the Monaco editor area — the file is uploaded via `/api/upload` on save.

The "New Collection" header button opens a small modal form (name, description, color picker) rather than the drawer.

## Asset Drawer

Slide-out panel from the right, 680px wide (full on mobile). Not a separate route — overlays the current page.

### View mode

- Header: type-colored icon, title, type badge, language badge (snippets), date
- Content by type:
  - **Snippet** — Monaco editor, read-only, syntax highlighted by language
  - **Prompt/Note** — Monaco editor, read-only, Markdown mode
  - **Link** — URL display, copy button, open-in-new-tab button
  - **Image** — image preview + metadata (filename, size, type)
  - **File** — metadata + download button

### Edit mode

- Toggle via Edit button in header
- Monaco becomes writable, Save/Cancel footer appears
- Notes/Prompts get a Markdown preview toggle (rendered via react-markdown)
- Links: edit the URL
- Images/Files: no inline edit, re-upload to replace

### Actions

- Edit, Delete (confirmation dialog with backdrop), manage collection assignments

## Components

| Component | Purpose |
|-----------|---------|
| `sidebar.tsx` | Navigation + collections list in sidebar |
| `header.tsx` | Search bar + "New Collection" + "Add Item" buttons |
| `asset-drawer.tsx` | Slide-out view/edit panel |
| `monaco-editor.tsx` | Lazy-loaded Monaco wrapper via next/dynamic |
| `asset-card.tsx` | Asset list row (icon, title, subtitle, hover actions) |
| `collection-card.tsx` | Collection grid card (icon, name, count) |
| `quick-actions.tsx` | 6 create-type buttons on dashboard |

## Server Actions (`src/app/actions/`)

### assets.ts

- `createAsset(data)` — create with type-specific fields
- `updateAsset(id, data)` — update, scoped by userId
- `deleteAsset(id)` — delete + remove file from disk if IMAGE/FILE
- `getAssets(filters)` — list with type filter, sort, pagination
- `getAsset(id)` — single asset, scoped by userId
- `searchAssets(query)` — full-text search via `plainto_tsquery`, ranked by `ts_rank`
- `togglePin(id)` — flip pinned boolean
- `getDashboardData()` — pinned assets, pinned collections, recent 10 assets

### collections.ts

- `createCollection(data)` — create with name, description, color
- `updateCollection(id, data)` — update, scoped by userId
- `deleteCollection(id)` — delete collection + remove join table entries (not the assets)
- `getCollections()` — list all for user with item counts
- `getCollection(id)` — single collection with its assets
- `toggleCollectionPin(id)` — flip pinned boolean
- `addAssetToCollection(assetId, collectionId)` — insert join row
- `removeAssetFromCollection(assetId, collectionId)` — delete join row

## Infrastructure

### docker-compose.yml

Single service: `postgres:17-alpine` on port 5432 with a named volume `pgdata`. Next.js runs on the host.

### Environment variables (.env)

```
DATABASE_URL=postgresql://cellar:cellar@localhost:5432/cellar
BETTER_AUTH_SECRET=<random-secret>
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=<from-github>
GITHUB_CLIENT_SECRET=<from-github>
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Full-text search setup

Managed via raw SQL in a Prisma migration:

1. Add `searchVector tsvector` column to Asset
2. Create GIN index on `searchVector`
3. Create trigger function that sets `searchVector = setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content, '')), 'B') || setweight(to_tsvector('english', coalesce(description, '')), 'C')` on INSERT/UPDATE

### File upload flow

Browser → POST multipart to `/api/upload` → validate auth + file size (10MB default) → stream to `uploads/{userId}/{uuid}.ext` → return path → create Asset record with filePath.

Files served via `/api/files/[...path]` with auth check (verify the file belongs to the requesting user's userId directory).

## UI Design

Dark theme matching the prototype. Material Design 3-inspired color tokens:

- Background: `#0a0e14`
- Surface containers: `#0e141c`, `#121a25`, `#16202e`, `#1a2637`
- Primary: `#b9c3ff` / Primary container: `#0033c2`
- Text: `#d9e6fd` (on-surface), `#9facc1` (on-surface-variant), `#6a768a` (outline)
- Error: `#ec7c8a`

Glass effects with `backdrop-filter: blur()`, ghost borders (`border: 1px solid rgba(60,73,91,0.2)`), custom scrollbars. Uppercase tracking-widest labels. Inter for UI text, JetBrains Mono for code/editor.
