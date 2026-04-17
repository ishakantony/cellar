# Sidebar, Header, and CollectionModal Storybook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose Sidebar, Header, and CollectionModal into reusable components with full Storybook coverage, using react-hook-form + zod for form validation (following auth form patterns).

**Architecture:** Create new components organized by feature (following auth/ pattern). Generic components go in ui/, layout-specific in layout/, collection-specific alongside collection-modal. Use atomic design concepts for discussion only, not file structure.

**Tech Stack:** React, TypeScript, Next.js, Tailwind CSS, Storybook, react-hook-form, zod, @hookform/resolvers, Lucide React

---

## File Structure Overview

Following the `components/auth/` pattern - flat structure with `.tsx` and `.stories.tsx` side by side:

```
src/
├── components/
│   ├── ui/                           # GENERIC components (existing + new)
│   │   ├── color-picker.tsx          # NEW - generic color picker
│   │   ├── color-picker.stories.tsx
│   │   └── ...                       # existing Button, Input, Modal, etc.
│   │
│   ├── layout/                       # LAYOUT components
│   │   ├── sidebar.tsx               # REFACTORED
│   │   ├── sidebar.stories.tsx       # NEW
│   │   ├── header.tsx                # REFACTORED
│   │   ├── header.stories.tsx        # NEW
│   │   ├── nav-item.tsx              # NEW - sidebar navigation item
│   │   ├── nav-item.stories.tsx
│   │   ├── nav-section.tsx           # NEW - navigation section with header
│   │   ├── nav-section.stories.tsx
│   │   ├── sidebar-toggle.tsx        # NEW - collapse/expand button
│   │   ├── sidebar-toggle.stories.tsx
│   │   └── user-menu.tsx             # NEW - user profile section
│   │   └── user-menu.stories.tsx
│   │
│   ├── collections/                  # COLLECTION components
│   │   └── ...                       # existing collection components
│   │
│   ├── collection-form.tsx           # NEW - form with validation
│   ├── collection-form.stories.tsx
│   ├── collection-modal.tsx          # REFACTORED - uses Modal atom
│   └── collection-modal.stories.tsx  # NEW
```

**Key Points:**

- Generic `ColorPicker` → `components/ui/` (like Button, Input)
- Layout-specific (NavItem, UserMenu, etc.) → `components/layout/`
- Collection-specific (CollectionForm) → `components/` (root, like auth forms)
- **NO atoms/molecules folders** - those terms are for discussion only

---

## Phase 1: Create Generic UI Components

### Task 1: Create ColorPicker UI Component

**Files:**

- Create: `src/components/ui/color-picker.tsx`
- Create: `src/components/ui/color-picker.stories.tsx`

**Location:** `components/ui/` (generic, reusable like Button, Input)

- [ ] **Step 1: Write ColorPicker component**

```typescript
// src/components/ui/color-picker.tsx
'use client';

import { cn } from '@/lib/utils';

export interface ColorOption {
  value: string;
  label: string;
  className: string;
}

export const DEFAULT_COLOR_OPTIONS: ColorOption[] = [
  { value: '#3b82f6', label: 'Blue', className: 'bg-blue-500' },
  { value: '#a855f7', label: 'Purple', className: 'bg-purple-500' },
  { value: '#10b981', label: 'Green', className: 'bg-emerald-500' },
  { value: '#f59e0b', label: 'Amber', className: 'bg-amber-500' },
  { value: '#ef4444', label: 'Red', className: 'bg-red-500' },
  { value: '#ec4899', label: 'Pink', className: 'bg-pink-500' },
];

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  options?: ColorOption[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export function ColorPicker({
  value,
  onChange,
  options = DEFAULT_COLOR_OPTIONS,
  size = 'md',
  className,
}: ColorPickerProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full transition-all',
            sizeClasses[size],
            option.className,
            value === option.value
              ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high scale-110'
              : 'opacity-60 hover:opacity-100'
          )}
          title={option.label}
          aria-label={`Select ${option.label} color`}
          aria-pressed={value === option.value}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write ColorPicker stories**

```typescript
// src/components/ui/color-picker.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { ColorPicker, DEFAULT_COLOR_OPTIONS } from './color-picker';

const meta: Meta<typeof ColorPicker> = {
  component: ColorPicker,
  title: 'UI/ColorPicker',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  args: {
    value: '#3b82f6',
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    value: '#a855f7',
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: '#10b981',
    onChange: fn(),
    options: DEFAULT_COLOR_OPTIONS,
    size: 'lg',
  },
};

export const CustomOptions: Story = {
  args: {
    value: '#ff0000',
    onChange: fn(),
    options: [
      { value: '#ff0000', label: 'Red', className: 'bg-red-600' },
      { value: '#00ff00', label: 'Green', className: 'bg-green-600' },
      { value: '#0000ff', label: 'Blue', className: 'bg-blue-600' },
    ],
    size: 'md',
  },
};
```

- [ ] **Step 3: Run Storybook to verify**

```bash
npm run storybook
# Navigate to UI/ColorPicker
# Verify all 4 stories render correctly
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/color-picker.tsx src/components/ui/color-picker.stories.tsx
git commit -m "feat: add ColorPicker UI component with Storybook stories"
```

---

## Phase 2: Create Layout Components

### Task 2: Create NavItem Component

**Files:**

- Create: `src/components/layout/nav-item.tsx`
- Create: `src/components/layout/nav-item.stories.tsx`

**Location:** `components/layout/` (sidebar-specific)

- [ ] **Step 1: Write NavItem component**

```typescript
// src/components/layout/nav-item.tsx
'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  className?: string;
}

export function NavItem({ href, icon: Icon, label, active = false, className }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase transition-all duration-150',
        active
          ? 'text-primary bg-primary/10 border-r-2 border-primary'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100',
        className
      )}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </Link>
  );
}
```

- [ ] **Step 2: Write NavItem stories**

```typescript
// src/components/layout/nav-item.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NavItem } from './nav-item';
import { Home, Settings } from 'lucide-react';

const meta: Meta<typeof NavItem> = {
  component: NavItem,
  title: 'Layout/NavItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    active: false,
  },
};

export const Active: Story = {
  args: {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    active: true,
  },
};

export const WithLongLabel: Story = {
  args: {
    href: '/settings',
    icon: Settings,
    label: 'System Settings & Configuration',
    active: false,
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/nav-item.tsx src/components/layout/nav-item.stories.tsx
git commit -m "feat: add NavItem layout component with Storybook stories"
```

---

### Task 3: Create NavSection Component

**Files:**

- Create: `src/components/layout/nav-section.tsx`
- Create: `src/components/layout/nav-section.stories.tsx`

**Location:** `components/layout/` (sidebar-specific)

- [ ] **Step 1: Write NavSection component**

```typescript
// src/components/layout/nav-section.tsx
'use client';

import { type LucideIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { NavItem } from './nav-item';
import { cn } from '@/lib/utils';

export interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  label: string;
  type?: string;
}

export interface NavSectionProps {
  title: string;
  items: NavItemConfig[];
  activePath: string;
  searchParams?: { get: (key: string) => string | null };
  className?: string;
}

function isItemActive(
  item: NavItemConfig,
  pathname: string,
  searchParams?: NavSectionProps['searchParams']
): boolean {
  if (item.type) {
    return pathname === '/assets' && searchParams?.get('type') === item.type;
  }
  if (item.href === '/assets') {
    return pathname === '/assets' && !searchParams?.get('type');
  }
  return pathname === item.href;
}

export function NavSection({ title, items, activePath, searchParams, className }: NavSectionProps) {
  return (
    <div className={cn('px-4 py-2', className)}>
      <Label className="text-[10px] uppercase tracking-widest text-outline block mb-2 px-4">
        {title}
      </Label>
      {items.map(item => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={isItemActive(item, activePath, searchParams)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write NavSection stories**

```typescript
// src/components/layout/nav-section.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { NavSection } from './nav-section';
import { LayoutDashboard, Package, Folder } from 'lucide-react';

const meta: Meta<typeof NavSection> = {
  component: NavSection,
  title: 'Layout/NavSection',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NavSection>;

const mockItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assets', icon: Package, label: 'All Items' },
  { href: '/collections', icon: Folder, label: 'All Collections' },
];

export const Default: Story = {
  args: {
    title: 'General',
    items: mockItems,
    activePath: '/dashboard',
  },
};

export const WithActiveItem: Story = {
  args: {
    title: 'General',
    items: mockItems,
    activePath: '/assets',
  },
};

export const WithQueryParam: Story = {
  args: {
    title: 'Assets',
    items: [
      { href: '/assets?type=SNIPPET', icon: Package, label: 'Snippets', type: 'SNIPPET' },
      { href: '/assets?type=LINK', icon: Package, label: 'Links', type: 'LINK' },
    ],
    activePath: '/assets',
    searchParams: {
      get: (key: string) => (key === 'type' ? 'SNIPPET' : null),
    },
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/nav-section.tsx src/components/layout/nav-section.stories.tsx
git commit -m "feat: add NavSection layout component with Storybook stories"
```

---

### Task 4: Create SidebarToggle Component

**Files:**

- Create: `src/components/layout/sidebar-toggle.tsx`
- Create: `src/components/layout/sidebar-toggle.stories.tsx`

**Location:** `components/layout/` (sidebar-specific)

- [ ] **Step 1: Write SidebarToggle component**

```typescript
// src/components/layout/sidebar-toggle.tsx
'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

export interface SidebarToggleProps {
  onClick: () => void;
  collapsed?: boolean;
  className?: string;
}

export function SidebarToggle({ onClick, collapsed = false, className }: SidebarToggleProps) {
  return (
    <IconButton
      icon={collapsed ? PanelLeftOpen : PanelLeftClose}
      onClick={onClick}
      label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      className={className}
    />
  );
}
```

- [ ] **Step 2: Write SidebarToggle stories**

```typescript
// src/components/layout/sidebar-toggle.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { SidebarToggle } from './sidebar-toggle';

const meta: Meta<typeof SidebarToggle> = {
  component: SidebarToggle,
  title: 'Layout/SidebarToggle',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarToggle>;

export const Open: Story = {
  args: {
    collapsed: false,
    onClick: fn(),
  },
};

export const Closed: Story = {
  args: {
    collapsed: true,
    onClick: fn(),
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/sidebar-toggle.tsx src/components/layout/sidebar-toggle.stories.tsx
git commit -m "feat: add SidebarToggle layout component with Storybook stories"
```

---

### Task 5: Create UserMenu Component

**Files:**

- Create: `src/components/layout/user-menu.tsx`
- Create: `src/components/layout/user-menu.stories.tsx`

**Location:** `components/layout/` (sidebar-specific)

- [ ] **Step 1: Write UserMenu component**

```typescript
// src/components/layout/user-menu.tsx
'use client';

import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  className?: string;
}

export function UserMenu({ user, onSignOut, className }: UserMenuProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-surface-container rounded-lg',
        className
      )}
    >
      <Avatar src={user.image} name={user.name} size="sm" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-xs font-bold text-slate-100">{user.name}</p>
      </div>
      <button
        onClick={onSignOut}
        className="text-slate-400 hover:text-error transition-colors"
        aria-label="Sign out"
      >
        <LogOut className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Write UserMenu stories**

```typescript
// src/components/layout/user-menu.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { UserMenu } from './user-menu';

const meta: Meta<typeof UserMenu> = {
  component: UserMenu,
  title: 'Layout/UserMenu',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

export const WithImage: Story = {
  args: {
    user: {
      ...mockUser,
      image: 'https://github.com/shadcn.png',
    },
    onSignOut: fn(),
  },
};

export const WithoutImage: Story = {
  args: {
    user: mockUser,
    onSignOut: fn(),
  },
};

export const LongName: Story = {
  args: {
    user: {
      name: 'Johnathan Christopher Doe-Smith',
      email: 'john@example.com',
    },
    onSignOut: fn(),
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/user-menu.tsx src/components/layout/user-menu.stories.tsx
git commit -m "feat: add UserMenu layout component with Storybook stories"
```

---

## Phase 3: Create Collection Components

### Task 6: Create CollectionForm Component

**Files:**

- Create: `src/components/collection-form.tsx`
- Create: `src/components/collection-form.stories.tsx`

**Location:** `components/` (root, like auth forms)

- [ ] **Step 1: Write CollectionForm component**

```typescript
// src/components/collection-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateCollectionSchema,
  type CreateCollectionInput,
} from '@/lib/validation';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ColorPicker, DEFAULT_COLOR_OPTIONS } from '@/components/ui/color-picker';
import { Label } from '@/components/ui/label';

export interface CollectionFormProps {
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  defaultValues?: Partial<CreateCollectionInput>;
  submitLabel?: string;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export function CollectionForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Create',
  mode = 'create',
  onCancel,
}: CollectionFormProps) {
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

      <div className="space-y-1.5">
        <Label>Color</Label>
        <ColorPicker
          value={color}
          onChange={val => setValue('color', val)}
          options={DEFAULT_COLOR_OPTIONS}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Write CollectionForm stories**

```typescript
// src/components/collection-form.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { CollectionForm } from './collection-form';

const meta: Meta<typeof CollectionForm> = {
  component: CollectionForm,
  title: 'CollectionForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CollectionForm>;

export const Empty: Story = {
  args: {
    onSubmit: fn(async () => {}),
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
};

export const Filled: Story = {
  args: {
    onSubmit: fn(async () => {}),
    defaultValues: {
      name: 'My Collection',
      description: 'A collection of items',
      color: '#a855f7',
    },
    submitLabel: 'Save',
    mode: 'edit',
    onCancel: fn(),
  },
};

export const WithErrors: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('A collection with this name already exists');
    }),
    defaultValues: {
      name: 'Existing Collection',
    },
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/collection-form.tsx src/components/collection-form.stories.tsx
git commit -m "feat: add CollectionForm with react-hook-form validation and Storybook stories"
```

---

## Phase 4: Refactor Organisms

### Task 7: Refactor Sidebar

**Files:**

- Modify: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/sidebar.stories.tsx`

- [ ] **Step 1: Refactor Sidebar component**

```typescript
// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  LayoutDashboard,
  Package,
  Folder,
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/auth/logo-icon';
import { SidebarToggle } from './sidebar-toggle';
import { NavSection } from './nav-section';
import { NavItem } from './nav-item';
import { UserMenu } from './user-menu';

export const generalNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/assets', icon: Package, label: 'All Items' },
  { href: '/collections', icon: Folder, label: 'All Collections' },
];

export const assetNav = [
  { href: '/assets?type=SNIPPET', icon: Code, label: 'Snippets', type: 'SNIPPET' },
  { href: '/assets?type=PROMPT', icon: Terminal, label: 'Prompts', type: 'PROMPT' },
  { href: '/assets?type=LINK', icon: LinkIcon, label: 'Links', type: 'LINK' },
  { href: '/assets?type=NOTE', icon: StickyNote, label: 'Notes', type: 'NOTE' },
  { href: '/assets?type=IMAGE', icon: Image, label: 'Images', type: 'IMAGE' },
  { href: '/assets?type=FILE', icon: FileText, label: 'Files', type: 'FILE' },
];

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  className?: string;
}

function SidebarContent({ collapsed, onToggle, user, className }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <aside
      className={`${
        collapsed ? 'hidden md:hidden' : 'flex md:flex'
      } flex-col h-full py-6 bg-surface-container-low contrast-125 w-64 border-r border-white/5 shrink-0 ${className}`}
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Logo className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">Cellar</h1>
          <SidebarToggle onClick={onToggle} className="ml-auto hidden md:flex" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        <NavSection
          title="General"
          items={generalNav}
          activePath={pathname}
          searchParams={searchParams}
        />
        <NavSection
          title="Assets"
          items={assetNav}
          activePath={pathname}
          searchParams={searchParams}
          className="mt-4"
        />
      </nav>

      {/* Footer */}
      <div className="px-4 mt-auto">
        <div className="border-t border-white/5 pt-3 mb-2 px-4">
          <NavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            active={pathname === '/settings'}
          />
        </div>
        <UserMenu user={user} onSignOut={handleSignOut} />
      </div>
    </aside>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={null}>
      <SidebarContent {...props} />
    </Suspense>
  );
}

// Re-export for use in Header
export { SidebarToggle };
```

- [ ] **Step 2: Create Sidebar stories**

```typescript
// src/components/layout/sidebar.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { Sidebar } from './sidebar';

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: 'Layout/Sidebar',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://github.com/shadcn.png',
};

export const Default: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
};

export const AssetsActive: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/assets',
        query: { type: 'SNIPPET' },
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/sidebar.tsx src/components/layout/sidebar.stories.tsx
git commit -m "refactor: decompose Sidebar using layout components"
```

---

### Task 8: Refactor Header

**Files:**

- Modify: `src/components/layout/header.tsx`
- Create: `src/components/layout/header.stories.tsx`

- [ ] **Step 1: Refactor Header component**

```typescript
// src/components/layout/header.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, FolderPlus, SquarePlus } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export interface HeaderProps {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle?: React.ReactNode;
  onAddItem: () => void;
  onAddCollection: () => void;
  searchPlaceholder?: string;
  className?: string;
}

export function Header({
  onMobileMenuToggle,
  sidebarCollapsed,
  sidebarToggle,
  onAddItem,
  onAddCollection,
  searchPlaceholder = 'Quick search...',
  className,
}: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header
      className={`flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5 ${className}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-4 flex-1">
        <IconButton
          icon={Menu}
          onClick={onMobileMenuToggle}
          label="Open menu"
          className="md:hidden"
        />
        {sidebarCollapsed && sidebarToggle}
      </div>

      {/* Center - Search */}
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none z-10" />
        <Input
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={searchPlaceholder}
          className="w-80 pl-10"
        />
      </form>

      {/* Right - Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Desktop - with text */}
        <Button onClick={onAddCollection} variant="ghost" size="sm" className="hidden sm:flex">
          <FolderPlus className="h-4 w-4" />
          Collection
        </Button>
        <Button onClick={onAddItem} variant="primary" size="sm" className="hidden sm:flex">
          <SquarePlus className="h-4 w-4" />
          Add Item
        </Button>

        {/* Mobile - icon only */}
        <Button onClick={onAddCollection} variant="ghost" size="sm" className="sm:hidden">
          <FolderPlus className="h-4 w-4" />
        </Button>
        <Button onClick={onAddItem} variant="primary" size="sm" className="sm:hidden">
          <SquarePlus className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Header stories**

```typescript
// src/components/layout/header.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { Header } from './header';
import { SidebarToggle } from './sidebar-toggle';

const meta: Meta<typeof Header> = {
  component: Header,
  title: 'Layout/Header',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
    onAddCollection: fn(),
  },
};

export const WithSidebarToggle: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: true,
    sidebarToggle: <SidebarToggle onClick={fn()} />,
    onAddItem: fn(),
    onAddCollection: fn(),
  },
};

export const SearchActive: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
    onAddCollection: fn(),
    searchPlaceholder: 'Search items...',
  },
};

export const Mobile: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
    onAddCollection: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/layout/header.tsx src/components/layout/header.stories.tsx
git commit -m "refactor: Header uses existing UI components"
```

---

### Task 9: Refactor CollectionModal

**Files:**

- Modify: `src/components/collection-modal.tsx`
- Create: `src/components/collection-modal.stories.tsx`

- [ ] **Step 1: Refactor CollectionModal component**

```typescript
// src/components/collection-modal.tsx
'use client';

import { Modal } from '@/components/ui/modal';
import { CollectionForm } from './collection-form';
import type { CreateCollectionInput } from '@/lib/validation';

export interface CollectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  initialData?: Partial<CreateCollectionInput>;
  mode?: 'create' | 'edit';
}

export function CollectionModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = 'create',
}: CollectionModalProps) {
  const title = mode === 'edit' ? 'Edit Collection' : 'New Collection';
  const submitLabel = mode === 'edit' ? 'Save' : 'Create';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      ariaLabel={title}
    >
      <CollectionForm
        onSubmit={async data => {
          await onSubmit(data);
          onClose();
        }}
        defaultValues={initialData}
        submitLabel={submitLabel}
        mode={mode}
        onCancel={onClose}
      />
    </Modal>
  );
}
```

- [ ] **Step 2: Create CollectionModal stories**

```typescript
// src/components/collection-modal.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { CollectionModal } from './collection-modal';

const meta: Meta<typeof CollectionModal> = {
  component: CollectionModal,
  title: 'CollectionModal',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      story: { inline: false, iframeHeight: 400 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CollectionModal>;

export const Create: Story = {
  args: {
    open: true,
    onClose: fn(),
    onSubmit: fn(async () => {}),
    mode: 'create',
  },
};

export const Edit: Story = {
  args: {
    open: true,
    onClose: fn(),
    onSubmit: fn(async () => {}),
    initialData: {
      name: 'My Collection',
      description: 'A collection of items',
      color: '#a855f7',
    },
    mode: 'edit',
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
    onSubmit: fn(async () => {}),
    mode: 'create',
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
git add src/components/collection-modal.tsx src/components/collection-modal.stories.tsx
git commit -m "refactor: CollectionModal uses Modal atom and CollectionForm"
```

---

## Phase 5: Integration & Testing

### Task 10: Verify Integration

- [ ] **Step 1: Check AppShell still works**

```bash
# Verify imports work
grep -n "import.*Sidebar" src/components/layout/app-shell.tsx
grep -n "import.*Header" src/components/layout/app-shell.tsx
grep -n "import.*CollectionModal" src/components/layout/app-shell.tsx
```

- [ ] **Step 2: Run development server**

```bash
npm run dev
# Navigate to app
# Test all functionality:
# - Sidebar collapse/expand
# - Navigation
# - Search
# - Add Collection modal
# - Form validation
```

- [ ] **Step 3: Run tests**

```bash
npm test
# All tests should pass
```

- [ ] **Step 4: Run Storybook and verify all stories**

```bash
npm run storybook
```

Verify all stories render:

- [ ] UI/ColorPicker (4 stories)
- [ ] Layout/NavItem (3 stories)
- [ ] Layout/NavSection (3 stories)
- [ ] Layout/SidebarToggle (2 stories)
- [ ] Layout/UserMenu (3 stories)
- [ ] Layout/Sidebar (4 stories)
- [ ] Layout/Header (4 stories)
- [ ] CollectionForm (3 stories)
- [ ] CollectionModal (3 stories)

**Total: 29 Storybook stories**

- [ ] **Step 5: Final commit**

```bash
git commit --allow-empty -m "feat: complete Sidebar, Header, CollectionModal Storybook implementation"
```

---

## Summary

### Components Created

**UI Components (1):**

1. ColorPicker (`components/ui/`)

**Layout Components (5):**

1. NavItem (`components/layout/`)
2. NavSection (`components/layout/`)
3. SidebarToggle (`components/layout/`)
4. UserMenu (`components/layout/`)

**Collection Components (2):**

1. CollectionForm (`components/`)
2. CollectionModal (`components/`)

**Refactored (3):**

1. Sidebar (`components/layout/`)
2. Header (`components/layout/`)

**Total: 11 components with 29 Storybook stories**

### Key Features

- ✅ Generic ColorPicker in ui/ (reusable)
- ✅ Layout components in layout/ (sidebar-specific)
- ✅ CollectionForm follows auth form pattern (react-hook-form + zod)
- ✅ CollectionModal uses existing Modal atom
- ✅ Flat structure (no atoms/molecules folders)
- ✅ All components have Storybook stories

### File Structure (Final)

```
src/components/
├── ui/
│   ├── color-picker.tsx          # NEW
│   ├── color-picker.stories.tsx
│   └── ... (existing components)
│
├── layout/
│   ├── sidebar.tsx               # REFACTORED
│   ├── sidebar.stories.tsx       # NEW
│   ├── header.tsx                # REFACTORED
│   ├── header.stories.tsx        # NEW
│   ├── nav-item.tsx              # NEW
│   ├── nav-item.stories.tsx
│   ├── nav-section.tsx           # NEW
│   ├── nav-section.stories.tsx
│   ├── sidebar-toggle.tsx        # NEW
│   ├── sidebar-toggle.stories.tsx
│   ├── user-menu.tsx             # NEW
│   └── user-menu.stories.tsx
│
├── collection-form.tsx           # NEW
├── collection-form.stories.tsx
├── collection-modal.tsx          # REFACTORED
└── collection-modal.stories.tsx
```

---

**Plan updated and saved!**

## Execution Options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks

**2. Inline Execution** - Execute tasks in this session using executing-plans

**Which approach would you prefer?**
