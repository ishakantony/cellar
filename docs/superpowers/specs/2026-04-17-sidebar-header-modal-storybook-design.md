# Sidebar, Header, and CollectionModal Storybook Implementation

**Date:** 2026-04-17  
**Status:** Approved for Implementation  
**Pattern:** Lifted State (controlled components)  
**Design System:** Atomic Design (Atoms → Molecules → Organisms)

---

## Overview

Bring the Sidebar, Header (Topbar), and CollectionModal components into Storybook with a full atomic design refactor. This improves testability, reusability, and documentation while maintaining the existing state management patterns.

### Goals

1. **Decompose** monolithic components into atomic parts
2. **Reuse** existing UI atoms (Button, Input, Modal, Avatar, IconButton)
3. **Document** all components in Storybook
4. **Maintain** existing "Lifted State" pattern (no compound components)
5. **Enable** isolated development and testing

---

## Existing Components Inventory

### Already Available Atoms

| Component    | Location             | Used By                         |
| ------------ | -------------------- | ------------------------------- |
| `Button`     | `ui/button.tsx`      | Header, Modal actions           |
| `IconButton` | `ui/icon-button.tsx` | SidebarToggle, MobileMenuToggle |
| `Input`      | `ui/input.tsx`       | SearchInput, CollectionForm     |
| `Label`      | `ui/label.tsx`       | CollectionForm fields           |
| `FormField`  | `ui/form-field.tsx`  | CollectionForm                  |
| `Modal`      | `ui/modal.tsx`       | CollectionModal                 |
| `Avatar`     | `ui/avatar.tsx`      | UserMenu                        |
| `Card`       | `ui/card.tsx`        | (available)                     |
| `Badge`      | `ui/badge.tsx`       | (available)                     |

### Target Components to Refactor

| Component         | Current Location       | Lines | Refactor Level               |
| ----------------- | ---------------------- | ----- | ---------------------------- |
| `Sidebar`         | `layout/sidebar.tsx`   | 198   | Organism → Atoms + Molecules |
| `Header`          | `layout/header.tsx`    | 72    | Organism → Atoms + Molecules |
| `CollectionModal` | `collection-modal.tsx` | 148   | Organism → Modal + Molecules |

---

## Atomic Design Breakdown

### 1. Sidebar Components

#### New Atoms to Create

**1.1 Logo**

```typescript
interface LogoProps {
  icon?: LucideIcon; // Default: Package
  title?: string; // Default: "Cellar"
  size?: 'sm' | 'md';
  className?: string;
}
```

- Renders: Icon container + brand text
- Replaces: Lines 76-89 in current sidebar.tsx
- Reusability: Sidebar, Auth pages, Marketing

**1.2 NavItem**

```typescript
interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  className?: string;
}
```

- Renders: Link with icon + label + active styling
- Replaces: Inline Link components (lines 101-113, 125-137, 145-153)
- Reusability: Sidebar, Mobile navigation, Breadcrumbs
- Active state: `text-primary bg-primary/10 border-r-2 border-primary`

**1.3 NavSectionHeader**

```typescript
interface NavSectionHeaderProps {
  title: string;
  className?: string;
}
```

- Renders: Uppercase tracking-widest label
- Replaces: Lines 95, 119 in current sidebar.tsx
- Reusability: Sidebar, Settings sections

**1.4 SidebarToggle**

```typescript
interface SidebarToggleProps {
  onClick: () => void;
  collapsed?: boolean; // determines icon direction
  className?: string;
}
```

- Uses: `IconButton` atom with PanelLeftClose/Open icons
- Replaces: Lines 82-88, SidebarCollapsedToggle function
- Reusability: Sidebar, Header (when sidebar collapsed)

**1.5 UserMenu**

```typescript
interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  className?: string;
}
```

- Uses: `Avatar` atom
- Replaces: Lines 155-166 in current sidebar.tsx
- Reusability: Sidebar, Header dropdown (future)

#### New Molecules to Create

**1.6 NavSection**

```typescript
interface NavSectionProps {
  title: string;
  items: NavItemConfig[];
  activePath: string;
  searchParams?: URLSearchParams;
  className?: string;
}

interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  type?: string; // For query param matching
}
```

- Composition: `NavSectionHeader` + `NavItem[]`
- Replaces: Lines 93-115 (General), Lines 117-139 (Assets)
- Active logic: Handles pathname + type matching

**1.7 SidebarFooter**

```typescript
interface SidebarFooterProps {
  user: UserMenuProps['user'];
  onSignOut: () => void;
  settingsHref?: string; // Default: '/settings'
  isSettingsActive?: boolean;
  className?: string;
}
```

- Composition: `NavItem` (Settings) + `UserMenu`
- Replaces: Lines 142-167 in current sidebar.tsx

#### Refactored Organism

**1.8 Sidebar**

```typescript
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: UserMenuProps['user'];
  generalNav?: NavItemConfig[]; // Default from current constants
  assetNav?: NavItemConfig[]; // Default from current constants
  className?: string;
}
```

- Composition:
  ```
  Sidebar
  ├── Logo + SidebarToggle
  ├── NavSection (General)
  ├── NavSection (Assets)
  └── SidebarFooter
  ```
- State: Receives `collapsed` and `onToggle` from parent (Lifted State pattern)
- Path matching: Uses Next.js `usePathname` and `useSearchParams`

---

### 2. Header (Topbar) Components

#### New Atoms to Create

**2.1 MobileMenuToggle**

```typescript
interface MobileMenuToggleProps {
  onClick: () => void;
  className?: string;
}
```

- Uses: `IconButton` atom with Menu icon
- Replaces: Lines 35-40 in current header.tsx
- Reusability: Header only (specific pattern)

**2.2 SearchInput**

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string; // Default: "Quick search..."
  className?: string;
}
```

- Uses: `Input` atom + Search icon
- Replaces: Lines 44-52 in current header.tsx
- Reusability: Header, Search pages
- Note: Router logic stays in parent Header component

#### New Molecules to Create

**2.3 HeaderActions**

```typescript
interface HeaderActionsProps {
  onAddCollection: () => void;
  onAddItem: () => void;
  collectionLabel?: string; // Default: "Collection"
  itemLabel?: string; // Default: "Add Item"
  className?: string;
}
```

- Uses: `Button` atom (ghost for Collection, primary for Add Item)
- Replaces: Lines 54-69 in current header.tsx
- Responsiveness:
  - Desktop (`sm:`): Shows text + icon
  - Mobile: Shows icon only

#### Refactored Organism

**2.4 Header**

```typescript
interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle?: React.ReactNode; // SidebarToggle atom instance
  onAddItem: () => void;
  onAddCollection: () => void;
  searchPlaceholder?: string;
  className?: string;
}
```

- Composition:
  ```
  Header
  ├── MobileMenuToggle
  ├── [SidebarToggle - conditional]
  ├── SearchInput
  └── HeaderActions
  ```
- State:
  - Receives callbacks for actions (Lifted State)
  - Manages local search query state
  - Handles router navigation on search submit

---

### 3. CollectionModal Components

#### New Atoms to Create

**3.1 ColorPicker**

```typescript
interface ColorOption {
  value: string; // Hex color
  label: string; // Accessible label
  className: string; // Tailwind bg class
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  options?: ColorOption[]; // Default: COLOR_OPTIONS constant
  size?: 'sm' | 'md' | 'lg'; // Default: 'md' (32px)
  className?: string;
}
```

- Renders: Row of circular color swatches with selection ring
- Replaces: Lines 111-125 in current collection-modal.tsx
- Reusability: CollectionModal, Tag color picker (future)
- Selection state: `ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high scale-110`

#### New Molecules to Create

**3.2 ColorField**

```typescript
interface ColorFieldProps {
  label?: string; // Default: "Color"
  value: string;
  onChange: (color: string) => void;
  options?: ColorOption[];
  className?: string;
}
```

- Composition: `Label` (existing) + `ColorPicker`
- Pattern: Follows same structure as `FormField` component
- Replaces: Lines 104-126 in current collection-modal.tsx

**3.3 CollectionForm**

Uses **react-hook-form** with **zodResolver** - following same pattern as auth forms (`sign-in-form.tsx`, `sign-up-form.tsx`).

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCollectionSchema, type CreateCollectionInput } from '@/lib/validation';

interface CollectionFormProps {
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  defaultValues?: Partial<CreateCollectionInput>;
  submitLabel?: string;
  mode?: 'create' | 'edit';
}
```

**Implementation Pattern:**

```typescript
export function CollectionForm({ onSubmit, defaultValues, submitLabel = 'Create', mode = 'create' }: CollectionFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: CreateCollectionInput) => {
    try {
      clearErrors('root');
      await onSubmit(data);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  // Watch values for controlled inputs
  const name = watch('name') || '';
  const description = watch('description') || '';
  const color = watch('color') || '#3b82f6';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField label="Name" error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Collection name"
          disabled={isSubmitting}
          error={errors.name?.message}
          value={name}
          onChange={val => setValue('name', val)}
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Input
          type="text"
          placeholder="Optional description"
          disabled={isSubmitting}
          error={errors.description?.message}
          value={description}
          onChange={val => setValue('description', val)}
        />
      </FormField>

      <ColorField
        label="Color"
        value={color}
        onChange={val => setValue('color', val)}
      />

      <FormActions
        onCancel={() => {}}
        onSubmit={() => {}}
        submitLabel={submitLabel}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
    </form>
  );
}
```

- **Validation Schema**: Uses existing `CreateCollectionSchema` from `@/lib/validation.ts`:
  ```typescript
  export const CreateCollectionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .optional(),
  });
  ```
- Composition:
  ```
  CollectionForm
  ├── Alert (root errors)
  ├── FormField + Input (Name) - with zod validation
  ├── FormField + Input (Description) - with zod validation
  ├── ColorField (Color) - controlled
  └── FormActions (submit/cancel)
  ```
- Replaces: Lines 70-143 in current collection-modal.tsx
- **Key Features**:
  - ✅ Form validation with zod schema
  - ✅ Error display via FormField component
  - ✅ Loading state during submission
  - ✅ Root error display for server errors
  - ✅ Controlled inputs via react-hook-form watch/setValue
  - ✅ Follows exact same pattern as SignInForm/SignUpForm

**3.4 FormActions**

```typescript
interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string; // Default: "Create" or "Save"
  cancelLabel?: string; // Default: "Cancel"
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}
```

- Composition: `Button` (ghost) + `Button` (primary)
- Replaces: Lines 127-143 in current collection-modal.tsx
- Reusability: CollectionModal, AssetDrawer, any form modal

#### Refactored Organism

**3.5 CollectionModal**

```typescript
interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  initialData?: Partial<CreateCollectionInput>;
  mode?: 'create' | 'edit'; // Derived from initialData if not provided
}
```

- **State Management**: Form state managed internally by **CollectionForm** via react-hook-form (lifted out of CollectionModal)
- **CRITICAL**: CollectionModal is now a thin wrapper - no useState for form fields!
- Composition:
  ```
  CollectionModal
  └── Modal (EXISTING atom from ui/modal.tsx)
      ├── title: "New Collection" | "Edit Collection"
      ├── children: CollectionForm (handles form state & validation)
      └── actions: FormActions
  ```
- **CRITICAL**: Uses existing `Modal` atom from `ui/modal.tsx` (NOT inline modal)
- State management: **No local state!** Form state managed by `CollectionForm` via react-hook-form
- Form submission:
  - CollectionForm validates using zod schema
  - Calls `onSubmit` with validated data
  - On success: CollectionForm resets, CollectionModal calls `onClose`
  - On error: displayed in form, modal stays open for retry

---

## State Management Pattern

### Lifted State (Current & Proposed)

We maintain the **Lifted State pattern** (Pattern 1 from React docs), NOT the Compound Component pattern used by shadcn/ui.

**Two Levels of State:**

1. **UI State (Lifted)**: Modal visibility, sidebar collapse - owned by parent
2. **Form State (Internal)**: Form values, validation, submission - owned by CollectionForm via react-hook-form

```typescript
// Parent component (AppShell) owns the UI state
function AppShell({ user }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />

      <main>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={<SidebarToggle onToggle={() => setSidebarCollapsed(false)} />}
          onAddCollection={() => setCollectionModalOpen(true)}
          // ...
        />
        {children}
      </main>

      {/* CollectionModal only controls visibility - form state is internal */}
      <CollectionModal
        open={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSubmit={async (data) => {
          await createCollection(data);
          setCollectionModalOpen(false);
        }}
      />
    </div>
  );
}
```

**Why This Hybrid Approach?**

- ✅ Modal visibility follows Lifted State pattern (explicit, traceable)
- ✅ Form state managed by react-hook-form (standard, robust validation)
- ✅ Matches auth form patterns in codebase
- ✅ Separation of concerns: parent controls WHEN, form controls WHAT

### Why Lifted State?

1. **Explicit**: Easy to trace data flow
2. **Simple**: No Context or magic
3. **Testable**: Components receive props, easy to mock
4. **SSR-Compatible**: Works with Next.js Server Components
5. **Familiar**: Matches current codebase patterns

---

## Storybook Story Structure

```
Layout/
├── Sidebar/
│   ├── Default
│   ├── Collapsed
│   ├── Mobile (viewport: mobile)
│   └── With Custom Nav
├── Header/
│   ├── Default
│   ├── With Sidebar Toggle
│   ├── Search Active
│   └── Mobile (viewport: mobile)
└── CollectionModal/
    ├── Create
    ├── Edit
    ├── Loading
    └── With Validation Errors

Atoms/
├── Logo/
│   ├── Default
│   └── Small
├── NavItem/
│   ├── Default
│   ├── Active
│   └── With Long Label
├── NavSectionHeader/
│   └── Default
├── SidebarToggle/
│   ├── Open
│   └── Close
├── UserMenu/
│   ├── With Image
│   └── Without Image
├── MobileMenuToggle/
│   └── Default
├── SearchInput/
│   ├── Empty
│   ├── With Value
│   └── Disabled
└── ColorPicker/
    ├── Default
    └── Custom Options

Molecules/
├── NavSection/
│   ├── Default
│   └── With Active Item
├── SidebarFooter/
│   ├── Default
│   └── Settings Active
├── HeaderActions/
│   ├── Default
│   └── Loading
├── ColorField/
│   └── Default
├── CollectionForm/
│   ├── Empty
│   ├── Filled
│   └── With Errors
└── FormActions/
    ├── Create Mode
    └── Edit Mode
```

---

## File Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx              # REFACTORED - uses atoms/molecules
│   │   ├── header.tsx               # REFACTORED - uses atoms/molecules
│   │   ├── sidebar.stories.tsx      # NEW
│   │   └── header.stories.tsx       # NEW
│   │
│   ├── collection-modal.tsx         # REFACTORED - uses Modal atom
│   └── collection-modal.stories.tsx # NEW
│
│   ├── ui/                          # EXISTING atoms
│   │   ├── modal.tsx                # ALREADY EXISTS
│   │   ├── button.tsx               # ALREADY EXISTS
│   │   ├── input.tsx                # ALREADY EXISTS
│   │   ├── form-field.tsx           # ALREADY EXISTS
│   │   ├── icon-button.tsx          # ALREADY EXISTS
│   │   ├── avatar.tsx               # ALREADY EXISTS
│   │   └── label.tsx                # ALREADY EXISTS
│   │
│   └── atoms/                       # NEW atoms
│       ├── logo.tsx
│       ├── logo.stories.tsx
│       ├── nav-item.tsx
│       ├── nav-item.stories.tsx
│       ├── nav-section-header.tsx
│       ├── nav-section-header.stories.tsx
│       ├── sidebar-toggle.tsx
│       ├── sidebar-toggle.stories.tsx
│       ├── user-menu.tsx
│       ├── user-menu.stories.tsx
│       ├── mobile-menu-toggle.tsx
│       ├── mobile-menu-toggle.stories.tsx
│       ├── search-input.tsx
│       ├── search-input.stories.tsx
│       ├── color-picker.tsx
│       └── color-picker.stories.tsx
│
│   └── molecules/                   # NEW molecules
│       ├── nav-section.tsx
│       ├── nav-section.stories.tsx
│       ├── sidebar-footer.tsx
│       ├── sidebar-footer.stories.tsx
│       ├── header-actions.tsx
│       ├── header-actions.stories.tsx
│       ├── color-field.tsx
│       ├── color-field.stories.tsx
│       ├── collection-form.tsx
│       ├── collection-form.stories.tsx
│       ├── form-actions.tsx
│       └── form-actions.stories.tsx
│
└── app/
    └── (app)/
        └── layout.tsx               # Uses AppShell (no changes needed)
```

---

## Implementation Phases

### Phase 1: Create New Atoms

1. Logo + stories
2. NavItem + stories
3. NavSectionHeader + stories
4. SidebarToggle + stories
5. UserMenu + stories
6. MobileMenuToggle + stories
7. SearchInput + stories
8. ColorPicker + stories

### Phase 2: Create New Molecules

1. NavSection + stories
2. SidebarFooter + stories
3. HeaderActions + stories
4. ColorField + stories
5. CollectionForm + stories
6. FormActions + stories

### Phase 3: Refactor Organisms

1. Refactor Sidebar (use new atoms/molecules)
2. Refactor Header (use new atoms/molecules)
3. Refactor CollectionModal (use existing Modal atom + new molecules)

### Phase 4: Create Organism Stories

1. Sidebar stories
2. Header stories
3. CollectionModal stories

### Phase 5: Integration & Testing

1. Update AppShell imports (if needed)
2. Verify all existing functionality works
3. Run Storybook and verify all stories render
4. Run tests to ensure no regressions

---

## Acceptance Criteria

- [ ] All 8 new atoms created with Storybook stories
- [ ] All 6 new molecules created with Storybook stories
- [ ] 3 organisms refactored using atomic composition
- [ ] All organisms have Storybook stories
- [ ] CollectionModal uses existing `Modal` atom (not inline modal)
- [ ] Lifted State pattern maintained throughout
- [ ] **CollectionForm uses react-hook-form with zodResolver for validation**
- [ ] **CollectionForm follows same pattern as SignInForm/SignUpForm**
- [ ] **Form validation displays errors via FormField component**
- [ ] No visual regressions in the UI
- [ ] All existing tests pass
- [ ] Storybook runs without errors
- [ ] Components work in both light and dark themes

---

## Notes

1. **No Compound Components**: We intentionally use Lifted State instead of shadcn/ui's Compound Component pattern for simplicity and explicitness.

2. **Reuse Existing Modal**: CollectionModal MUST use the existing `ui/modal.tsx` atom instead of inline modal implementation.

3. **No State in Atoms**: Atoms are stateless and receive all data via props.

4. **Pathname Handling**: Navigation-related components (NavItem, NavSection) use Next.js `usePathname` and `useSearchParams` hooks internally.

5. **Mobile Responsiveness**: Components must work on mobile viewports with appropriate stories.

6. **Accessibility**: Maintain existing accessibility features (aria-labels, keyboard navigation, focus management).

7. **Form Validation Pattern**: CollectionForm MUST follow the same pattern as auth forms:
   - Use `react-hook-form` with `zodResolver`
   - Use existing `CreateCollectionSchema` from `@/lib/validation.ts`
   - Display errors via `FormField` component
   - Use `watch()` and `setValue()` for controlled inputs
   - Handle root errors with `Alert` component
   - Follow `SignInForm` / `SignUpForm` implementation exactly

---

## Open Questions (None)

All design decisions have been finalized:

- ✅ Lifted State pattern (not Compound Components)
- ✅ Use existing Modal atom
- ✅ Full atomic design breakdown
- ✅ Story structure defined
- ✅ File structure defined
- ✅ **Form validation with react-hook-form + zod (same as auth forms)**

Ready for implementation plan creation.
