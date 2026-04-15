# Component Refactoring Design Document

**Date:** 2026-04-15  
**Topic:** Component Structure Refactoring for Reusability  
**Status:** Approved  

## Overview

This document outlines the refactoring of Cellar's React components from inline, duplicated patterns to a structured component library with clear separation of concerns.

## Current State Analysis

### Problems Identified

1. **Large Components**: `asset-drawer.tsx` is 490 lines handling 6 different asset types
2. **Code Duplication**: `TYPE_CONFIG` mapping duplicated between `asset-card.tsx` and `asset-drawer.tsx`
3. **Repeated Dropdown Pattern**: Both card components implement identical dropdown menu logic (40+ lines each)
4. **UI Primitive Duplication**: 15+ button variations, 7+ input patterns, all inlined
5. **Client Page Duplication**: All 3 client pages share similar state management for drawers/delete dialogs

### Component Inventory

| Component | Lines | Primary Concerns |
|-----------|-------|------------------|
| asset-drawer.tsx | 490 | View/edit/create, 6 type renderers, file upload |
| sidebar.tsx | 211 | Navigation, user profile, sign-out |
| asset-card.tsx | 177 | Card display, dropdown menu, type icons |
| collection-card.tsx | 113 | Card display, dropdown menu, color handling |
| collection-modal.tsx | 145 | Create/edit modal with color picker |
| file-dropzone.tsx | 105 | File upload with drag-drop |
| header.tsx | 71 | Search, action buttons |
| quick-actions.tsx | 61 | Type selection grid |
| delete-dialog.tsx | 63 | Confirmation dialog |

## Proposed Architecture

### Folder Structure

```
src/
├── components/
│   ├── ui/                    # 16 atomic primitives
│   │   ├── button.tsx
│   │   ├── icon-button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── label.tsx
│   │   ├── alert.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── icon-badge.tsx
│   │   ├── drawer.tsx
│   │   ├── modal.tsx
│   │   ├── action-menu.tsx
│   │   ├── empty-state.tsx
│   │   └── tabs.tsx
│   ├── assets/                # Asset-specific components
│   │   ├── asset-card.tsx
│   │   ├── asset-icon.tsx
│   │   ├── asset-type-badge.tsx
│   │   ├── asset-drawer.tsx
│   │   ├── asset-type-editor.tsx
│   │   └── asset-type-viewer.tsx
│   ├── collections/           # Collection-specific components
│   │   ├── collection-card.tsx
│   │   └── collection-modal.tsx
│   └── layout/                # Layout components
│       ├── sidebar.tsx
│       ├── header.tsx
│       └── app-shell.tsx
├── hooks/
│   ├── use-click-outside.ts
│   ├── use-asset-management.ts
│   └── use-drawer-state.ts
└── lib/
    ├── asset-types.ts         # Shared TYPE_CONFIG
    └── colors.ts              # Shared COLORS
```

## Component Specifications

### UI Primitives (16 components)

#### Button

**Purpose:** All button variations with consistent styling

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Variants:**
- `primary`: Main actions (Save, Create) - `bg-primary-container/30 border-primary/30 text-primary`
- `secondary`: Alternative actions (Cancel) - `bg-surface-container ghost-border`
- `danger`: Destructive actions (Delete) - `bg-error/20 border-error/30 text-error`
- `ghost`: Subtle actions - transparent background
- `outline`: Bordered actions - border only

**Sizes:**
- `sm`: `px-3 py-1.5 text-xs` (header buttons)
- `md`: `px-4 py-2 text-xs` (default)
- `lg`: `px-4 py-2.5 text-xs` (auth forms)

#### IconButton

**Purpose:** Icon-only buttons for compact actions

**Props:**
```typescript
interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  label?: string; // for aria-label
}
```

#### Input

**Purpose:** Consistent text input styling

**Props:**
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Default Classes:**
```
w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm 
text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50
```

#### Select

**Purpose:** Dropdown select inputs

**Props:**
```typescript
interface SelectProps<T> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}
```

**Default Classes:**
```
text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded 
bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50
```

#### Label

**Purpose:** Form labels with consistent styling

**Props:**
```typescript
interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}
```

**Default Classes:**
```
mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant
```

#### Alert

**Purpose:** Status/error messages

**Props:**
```typescript
interface AlertProps {
  variant: 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}
```

**Default Classes (error):**
```
rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs text-error
```

#### Separator

**Purpose:** Divider lines

**Props:**
```typescript
interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}
```

**Default Classes:**
```
h-px flex-1 bg-outline-variant/30
```

#### Avatar

**Purpose:** User avatars with fallback initials

**Props:**
```typescript
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Sizes:**
- `sm`: `h-8 w-8` (sidebar)
- `md`: `h-10 w-10`
- `lg`: `h-12 w-12`

#### Badge

**Purpose:** Type/status indicators

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}
```

**Default Classes:**
```
text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded
```

#### Card

**Purpose:** Card containers with ghost-border

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}
```

**Default Classes:**
```
bg-surface-container ghost-border rounded-xl transition-all
```

**Hover Classes (when hoverable):**
```
hover:bg-surface-bright hover:border-white/20 cursor-pointer
```

#### IconBadge

**Purpose:** Colored icon wrappers for asset/collection types

**Props:**
```typescript
interface IconBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'snippet' | 'prompt' | 'note' | 'link' | 'image' | 'file' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Variant Classes (from TYPE_CONFIG):**
- `snippet`: `bg-primary/10 text-primary`
- `prompt`: `bg-tertiary-container/20 text-tertiary`
- `note`: `bg-amber-500/10 text-amber-400`
- `link`: `bg-cyan-500/10 text-cyan-400`
- `image`: `bg-rose-500/10 text-rose-400`
- `file`: `bg-violet-500/10 text-violet-400`

**Sizes:**
- `sm`: `h-7 w-7` with `h-[14px] w-[14px]` icon
- `md`: `h-9 w-9` with `h-[18px] w-[18px]` icon
- `lg`: `h-10 w-10` with `h-5 w-5` icon

#### Drawer

**Purpose:** Slide-out panels

**Props:**
```typescript
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}
```

**Default Classes:**
```
fixed inset-y-0 right-0 flex flex-col z-50 bg-surface-container-low shadow-2xl
```

**Widths:**
- `md`: `w-full md:w-[480px]`
- `lg`: `w-full md:w-[680px]`

#### Modal

**Purpose:** Centered dialogs

**Props:**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md';
}
```

**Default Classes:**
```
fixed inset-0 bg-black/60 z-[60] flex items-center justify-center
bg-surface-container-high rounded-xl shadow-2xl
```

**Sizes:**
- `sm`: `w-[360px]` (delete dialog)
- `md`: `w-[400px]` (collection modal)

#### ActionMenu

**Purpose:** Dropdown menus with items

**Props:**
```typescript
interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'danger';
  onClick: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger: React.ReactNode;
  align?: 'left' | 'right';
}
```

**Default Classes:**
```
absolute mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl 
border border-white/10 py-1 z-50
```

**Item Classes:**
```
flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors
```

#### EmptyState

**Purpose:** Empty list placeholders

**Props:**
```typescript
interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}
```

**Default Classes:**
```
py-16 text-center
```

**Message Classes:**
```
text-xs text-outline
```

#### Tabs

**Purpose:** Filter/navigation tabs

**Props:**
```typescript
interface TabOption {
  value: string | null;
  label: string;
}

interface TabsProps {
  value: string | null;
  options: TabOption[];
  onChange: (value: string | null) => void;
  size?: 'sm' | 'md';
}
```

**Default Classes:**
```
flex items-center gap-1 overflow-x-auto
```

**Tab Classes (active):**
```
bg-primary/10 text-primary
```

**Tab Classes (inactive):**
```
text-outline hover:text-on-surface-variant hover:bg-surface-container
```

### Domain Components

#### AssetCard

**Purpose:** Display asset in list/grid

**Props:**
```typescript
interface AssetCardProps {
  asset: {
    id: string;
    type: AssetType;
    title: string;
    language?: string | null;
    pinned: boolean;
    updatedAt: Date;
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  compact?: boolean;
}
```

**Components Used:** `Card`, `IconBadge`, `ActionMenu`

#### AssetIcon

**Purpose:** Type-based icon lookup

**Props:**
```typescript
interface AssetIconProps {
  type: AssetType;
  className?: string;
}
```

**Returns:** Lucide icon component for the type

#### AssetTypeBadge

**Purpose:** Type label badge

**Props:**
```typescript
interface AssetTypeBadgeProps {
  type: AssetType;
  showLabel?: boolean;
}
```

**Components Used:** `Badge`

#### AssetDrawer

**Purpose:** View/edit/create assets

**Props:**
```typescript
interface AssetDrawerProps {
  open: boolean;
  onClose: () => void;
  asset?: Asset | null;
  mode: 'view' | 'edit' | 'create';
  defaultType?: AssetType;
  onSaved?: () => void;
  onDelete?: () => void;
}
```

**Components Used:** `Drawer`, `Tabs`, `Input`, `Select`, `AssetTypeEditor`, `AssetTypeViewer`

#### AssetTypeEditor

**Purpose:** Edit form for each asset type

**Props:**
```typescript
interface AssetTypeEditorProps {
  type: AssetType;
  data: Partial<Asset>;
  onChange: (data: Partial<Asset>) => void;
}
```

**Components Used:** `Input`, `MonacoEditor`, `FileDropzone`, `MarkdownPreview`

#### AssetTypeViewer

**Purpose:** Read-only view for each asset type

**Props:**
```typescript
interface AssetTypeViewerProps {
  type: AssetType;
  asset: Asset;
  onCopy?: () => void;
  onOpen?: () => void;
  onDownload?: () => void;
}
```

**Components Used:** `MonacoEditor`, `MarkdownPreview`, `Button`

#### CollectionCard

**Purpose:** Display collection in grid

**Props:**
```typescript
interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    color?: string | null;
    pinned: boolean;
    _count: { assets: number };
  };
  onClick: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}
```

**Components Used:** `Card`, `ActionMenu`

#### CollectionModal

**Purpose:** Create/edit collection

**Props:**
```typescript
interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  initialData?: { name: string; description?: string; color?: string };
}
```

**Components Used:** `Modal`, `Input`, `Label`, `ColorPicker`

### Layout Components

#### Sidebar

**Purpose:** Navigation sidebar

**Props:**
```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; email: string; image?: string | null };
}
```

**Components Used:** `Avatar`, `Button`

#### Header

**Purpose:** Top bar with search and actions

**Props:**
```typescript
interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle: React.ReactNode;
  onAddItem: () => void;
  onAddCollection: () => void;
}
```

**Components Used:** `Input`, `Button`

## Shared Hooks

### useClickOutside

**Purpose:** Detect clicks outside a ref

**Signature:**
```typescript
function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  onClickOutside: () => void,
  enabled?: boolean
): void
```

**Usage:**
```typescript
const menuRef = useRef<HTMLDivElement>(null);
useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);
```

### useDrawerState

**Purpose:** Manage drawer state and selected item

**Signature:**
```typescript
interface UseDrawerStateOptions<T> {
  onSaved?: () => void;
}

interface DrawerState<T> {
  open: boolean;
  selected: T | null;
  mode: 'view' | 'edit' | 'create';
  openView: (item: T) => void;
  openEdit: (item: T) => void;
  openCreate: () => void;
  close: () => void;
}

function useDrawerState<T>(options?: UseDrawerStateOptions<T>): DrawerState<T>
```

**Usage:**
```typescript
const drawer = useDrawerState<Asset>({ onSaved: () => router.refresh() });
```

### useAssetManagement

**Purpose:** Shared state for pin/delete/refresh patterns

**Signature:**
```typescript
interface UseAssetManagementOptions {
  onAction?: () => void;
}

interface AssetManagementState {
  deleteTarget: { id: string; title: string } | null;
  actionError: string | null;
  setDeleteTarget: (target: { id: string; title: string } | null) => void;
  clearError: () => void;
  handleTogglePin: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
}

function useAssetManagement(
  togglePinFn: (id: string) => Promise<void>,
  deleteFn: (id: string) => Promise<void>,
  options?: UseAssetManagementOptions
): AssetManagementState
```

**Usage:**
```typescript
const assets = useAssetManagement(togglePin, deleteAsset, {
  onAction: () => router.refresh()
});
```

## Shared Constants

### lib/asset-types.ts

```typescript
export const TYPE_CONFIG: Record<
  AssetType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconWrap: string;
    badge: string;
    label: string;
    defaultLanguage: string;
  }
> = {
  SNIPPET: {
    icon: Braces,
    iconWrap: 'bg-primary/10 text-primary',
    badge: 'text-primary bg-primary/10',
    label: 'Snippet',
    defaultLanguage: 'javascript',
  },
  PROMPT: {
    icon: Terminal,
    iconWrap: 'bg-tertiary-container/20 text-tertiary',
    badge: 'text-tertiary bg-tertiary/10',
    label: 'Prompt',
    defaultLanguage: 'markdown',
  },
  NOTE: {
    icon: StickyNote,
    iconWrap: 'bg-amber-500/10 text-amber-400',
    badge: 'text-amber-400 bg-amber-500/10',
    label: 'Note',
    defaultLanguage: 'markdown',
  },
  LINK: {
    icon: LinkIcon,
    iconWrap: 'bg-cyan-500/10 text-cyan-400',
    badge: 'text-cyan-400 bg-cyan-500/10',
    label: 'Link',
    defaultLanguage: 'plaintext',
  },
  IMAGE: {
    icon: ImageIcon,
    iconWrap: 'bg-rose-500/10 text-rose-400',
    badge: 'text-rose-400 bg-rose-500/10',
    label: 'Image',
    defaultLanguage: 'plaintext',
  },
  FILE: {
    icon: FileText,
    iconWrap: 'bg-violet-500/10 text-violet-400',
    badge: 'text-violet-400 bg-violet-500/10',
    label: 'File',
    defaultLanguage: 'plaintext',
  },
};

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'SNIPPET', label: 'Snippet' },
  { value: 'PROMPT', label: 'Prompt' },
  { value: 'NOTE', label: 'Note' },
  { value: 'LINK', label: 'Link' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'FILE', label: 'File' },
];
```

### lib/colors.ts

```typescript
export const COLLECTION_COLORS: Record<string, string> = {
  '#3b82f6': 'bg-blue-500/15 text-blue-400',
  '#a855f7': 'bg-purple-500/15 text-purple-400',
  '#10b981': 'bg-emerald-500/15 text-emerald-400',
  '#f59e0b': 'bg-amber-500/15 text-amber-400',
  '#ef4444': 'bg-red-500/15 text-red-400',
  '#ec4899': 'bg-pink-500/15 text-pink-400',
};

export const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#10b981', label: 'Green', className: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', className: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', className: 'bg-pink-500' },
];

export function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return 'bg-blue-500/15 text-blue-400';
}
```

## Component Boundaries

### UI Layer (`components/ui/`)

**Rules:**
- Pure presentational, no business logic
- Accept all data via props
- No direct imports from `app/` or `generated/`
- Can use `lucide-react` for icons
- Must be reusable across any domain

### Domain Layer (`components/assets/`, `components/collections/`)

**Rules:**
- Business logic for their domain
- Can import from `lib/`, `hooks/`, `generated/`
- Can import from `components/ui/`
- Compose UI primitives
- Handle domain-specific actions

### Layout Layer (`components/layout/`)

**Rules:**
- Shell components
- Handle navigation and routing
- Can import from all other layers
- Define page structure

## Migration Strategy

### Phase 1: Foundation
1. Create `lib/asset-types.ts` and `lib/colors.ts`
2. Create `hooks/use-click-outside.ts`
3. Create basic UI primitives: `Button`, `IconButton`, `Input`

### Phase 2: Core UI
4. Create remaining UI primitives
5. Refactor `ActionMenu` and replace inline dropdowns
6. Create `IconBadge` and replace TYPE_CONFIG lookups

### Phase 3: Domain Components
7. Refactor `AssetCard` to use new primitives
8. Refactor `CollectionCard` to use new primitives
9. Split `AssetDrawer` into smaller components
10. Refactor `CollectionModal` to use `Modal` primitive

### Phase 4: Layout & Cleanup
11. Refactor `Sidebar` and `Header`
12. Create shared hooks for client pages
13. Update client pages to use new hooks
14. Delete old inline patterns

## Success Criteria

- [ ] All 16 UI primitives created and documented
- [ ] All 8 domain components refactored
- [ ] 3 shared hooks created
- [ ] 2 shared constant files created
- [ ] No duplicated TYPE_CONFIG or dropdown logic
- [ ] All buttons use Button component
- [ ] All inputs use Input component
- [ ] All client pages use shared hooks
- [ ] Zero TypeScript errors
- [ ] Visual parity with original design

## Notes

- The existing `file-dropzone.tsx`, `monaco-editor.tsx`, and `markdown-preview.tsx` are already well-contained and don't need refactoring
- `quick-actions.tsx` can use `Button` primitive but may remain as-is due to its specific layout needs
- `delete-dialog.tsx` will be replaced by `Modal` + `Alert` primitives
