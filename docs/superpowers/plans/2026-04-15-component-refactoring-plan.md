# Component Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Cellar's React components from inline patterns to a structured component library with 16 UI primitives, 8 domain components, and shared hooks/constants.

**Architecture:** Create a three-layer architecture: UI primitives (pure presentational), domain components (business logic), and layout components. Use shared hooks for common patterns and extract duplicated TYPE_CONFIG and dropdown logic.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide React icons

---

## File Structure Overview

### New Files to Create (27 components + 3 hooks + 2 libs)

**UI Primitives (16):**
- `src/components/ui/button.tsx`
- `src/components/ui/icon-button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/icon-badge.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/modal.tsx`
- `src/components/ui/action-menu.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/tabs.tsx`

**Domain Components (6 new, 2 refactored):**
- `src/components/assets/asset-card.tsx` (refactor)
- `src/components/assets/asset-icon.tsx` (new)
- `src/components/assets/asset-type-badge.tsx` (new)
- `src/components/assets/asset-drawer.tsx` (refactor)
- `src/components/assets/asset-type-editor.tsx` (new)
- `src/components/assets/asset-type-viewer.tsx` (new)
- `src/components/collections/collection-card.tsx` (refactor)
- `src/components/collections/collection-modal.tsx` (refactor)

**Layout Components (1 new, 2 refactored):**
- `src/components/layout/sidebar.tsx` (refactor - move from root)
- `src/components/layout/header.tsx` (refactor - move from root)
- `src/components/layout/app-shell.tsx` (new - move from app folder)

**Hooks (3):**
- `src/hooks/use-click-outside.ts`
- `src/hooks/use-drawer-state.ts`
- `src/hooks/use-asset-management.ts`

**Libraries (2):**
- `src/lib/asset-types.ts`
- `src/lib/colors.ts`

### Files to Delete/Deprecate
- `src/components/asset-card.tsx` → move to `src/components/assets/asset-card.tsx`
- `src/components/collection-card.tsx` → move to `src/components/collections/collection-card.tsx`
- `src/components/asset-drawer.tsx` → move to `src/components/assets/asset-drawer.tsx`
- `src/components/collection-modal.tsx` → move to `src/components/collections/collection-modal.tsx`
- `src/components/delete-dialog.tsx` → replace with Modal primitive
- `src/components/sidebar.tsx` → move to `src/components/layout/sidebar.tsx`
- `src/components/header.tsx` → move to `src/components/layout/header.tsx`
- `src/app/(app)/app-shell.tsx` → move to `src/components/layout/app-shell.tsx`

---

## Phase 1: Foundation (Shared Constants and Basic Hooks)

### Task 1: Create lib/asset-types.ts

**Files:**
- Create: `src/lib/asset-types.ts`

**Purpose:** Centralize TYPE_CONFIG and asset type constants

- [ ] **Step 1: Write the file**

```typescript
import {
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  Braces,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";

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
    iconWrap: "bg-primary/10 text-primary",
    badge: "text-primary bg-primary/10",
    label: "Snippet",
    defaultLanguage: "javascript",
  },
  PROMPT: {
    icon: Terminal,
    iconWrap: "bg-tertiary-container/20 text-tertiary",
    badge: "text-tertiary bg-tertiary/10",
    label: "Prompt",
    defaultLanguage: "markdown",
  },
  NOTE: {
    icon: StickyNote,
    iconWrap: "bg-amber-500/10 text-amber-400",
    badge: "text-amber-400 bg-amber-500/10",
    label: "Note",
    defaultLanguage: "markdown",
  },
  LINK: {
    icon: LinkIcon,
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    badge: "text-cyan-400 bg-cyan-500/10",
    label: "Link",
    defaultLanguage: "plaintext",
  },
  IMAGE: {
    icon: ImageIcon,
    iconWrap: "bg-rose-500/10 text-rose-400",
    badge: "text-rose-400 bg-rose-500/10",
    label: "Image",
    defaultLanguage: "plaintext",
  },
  FILE: {
    icon: FileText,
    iconWrap: "bg-violet-500/10 text-violet-400",
    badge: "text-violet-400 bg-violet-500/10",
    label: "File",
    defaultLanguage: "plaintext",
  },
};

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string }[] = [
  { value: "SNIPPET", label: "Snippet" },
  { value: "PROMPT", label: "Prompt" },
  { value: "NOTE", label: "Note" },
  { value: "LINK", label: "Link" },
  { value: "IMAGE", label: "Image" },
  { value: "FILE", label: "File" },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/asset-types.ts
git commit -m "feat: add asset-types constants with TYPE_CONFIG"
```

### Task 2: Create lib/colors.ts

**Files:**
- Create: `src/lib/colors.ts`

**Purpose:** Centralize collection color constants

- [ ] **Step 1: Write the file**

```typescript
export const COLLECTION_COLORS: Record<string, string> = {
  "#3b82f6": "bg-blue-500/15 text-blue-400",
  "#a855f7": "bg-purple-500/15 text-purple-400",
  "#10b981": "bg-emerald-500/15 text-emerald-400",
  "#f59e0b": "bg-amber-500/15 text-amber-400",
  "#ef4444": "bg-red-500/15 text-red-400",
  "#ec4899": "bg-pink-500/15 text-pink-400",
};

export const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue", className: "bg-blue-500" },
  { value: "#a855f7", label: "Purple", className: "bg-purple-500" },
  { value: "#10b981", label: "Green", className: "bg-emerald-500" },
  { value: "#f59e0b", label: "Amber", className: "bg-amber-500" },
  { value: "#ef4444", label: "Red", className: "bg-red-500" },
  { value: "#ec4899", label: "Pink", className: "bg-pink-500" },
];

export function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return "bg-blue-500/15 text-blue-400";
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/colors.ts
git commit -m "feat: add colors constants for collections"
```

### Task 3: Create hooks/use-click-outside.ts

**Files:**
- Create: `src/hooks/use-click-outside.ts`

**Purpose:** Reusable hook for closing dropdowns/menus on outside click

- [ ] **Step 1: Write the file**

```typescript
"use client";

import { useEffect, RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, onClickOutside, enabled]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-click-outside.ts
git commit -m "feat: add useClickOutside hook"
```

---

## Phase 2: UI Primitives - Core Components

### Task 4: Create ui/button.tsx

**Files:**
- Create: `src/components/ui/button.tsx`

**Purpose:** Reusable button with variants and sizes

- [ ] **Step 1: Create the Button component**

```typescript
"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-primary-container/30 border border-primary/30 text-primary hover:bg-primary-container/50 hover:border-primary/50",
  secondary:
    "bg-surface-container border border-white/10 ghost-border text-on-surface-variant hover:bg-surface-bright hover:text-slate-100",
  danger:
    "bg-error/20 border border-error/30 text-error hover:bg-error/30 hover:border-error/50",
  ghost:
    "bg-transparent text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright",
  outline:
    "bg-transparent border border-white/10 text-on-surface-variant hover:border-white/20 hover:text-slate-100",
};

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-xs",
  lg: "px-4 py-2.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded font-bold uppercase tracking-widest transition-all disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
cd /Users/ishak/Codebase/cellar && npx tsc --noEmit src/components/ui/button.tsx
```

Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "feat: add Button ui primitive"
```

### Task 5: Create ui/icon-button.tsx

**Files:**
- Create: `src/components/ui/icon-button.tsx`

**Purpose:** Icon-only button for compact actions

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface IconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger" | "ghost";
  size?: "sm" | "md";
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  label?: string;
}

const variantClasses: Record<string, string> = {
  default: "text-outline hover:text-slate-100 hover:bg-surface-bright",
  danger: "text-outline hover:text-error hover:bg-error/10",
  ghost: "text-outline hover:text-slate-100",
};

const sizeClasses: Record<string, string> = {
  sm: "p-1",
  md: "p-1.5",
};

const iconSizes: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-[18px] w-[18px]",
};

export function IconButton({
  icon: Icon,
  variant = "default",
  size = "md",
  onClick,
  className,
  label,
}: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded transition-all",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/icon-button.tsx
git commit -m "feat: add IconButton ui primitive"
```

### Task 6: Create ui/input.tsx

**Files:**
- Create: `src/components/ui/input.tsx`

**Purpose:** Consistent text input styling

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface InputProps {
  type?: "text" | "email" | "password" | "url";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  className,
  id,
}: InputProps) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50 transition-all",
        disabled && "cursor-not-allowed opacity-60",
        error && "ring-1 ring-error",
        className
      )}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/input.tsx
git commit -m "feat: add Input ui primitive"
```

### Task 7: Create ui/label.tsx

**Files:**
- Create: `src/components/ui/label.tsx`

**Purpose:** Form labels with consistent styling

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({ children, htmlFor, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant",
        className
      )}
    >
      {children}
    </label>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/label.tsx
git commit -m "feat: add Label ui primitive"
```

---

## Phase 3: UI Primitives - Container Components

### Task 8: Create ui/card.tsx

**Files:**
- Create: `src/components/ui/card.tsx`

**Purpose:** Card container with ghost-border and hover effects

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses: Record<string, string> = {
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  hoverable = false,
  onClick,
  className,
  padding = "md",
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface-container ghost-border rounded-xl transition-all",
        paddingClasses[padding],
        hoverable &&
          "hover:bg-surface-bright hover:border-white/20 cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/card.tsx
git commit -m "feat: add Card ui primitive"
```

### Task 9: Create ui/icon-badge.tsx

**Files:**
- Create: `src/components/ui/icon-badge.tsx`

**Purpose:** Colored icon wrapper for asset/collection types

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface IconBadgeProps {
  icon: React.ComponentType<{ className?: string }>;
  variant:
    | "snippet"
    | "prompt"
    | "note"
    | "link"
    | "image"
    | "file"
    | "collection";
  color?: string; // for collection colors
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantClasses: Record<string, string> = {
  snippet: "bg-primary/10 text-primary",
  prompt: "bg-tertiary-container/20 text-tertiary",
  note: "bg-amber-500/10 text-amber-400",
  link: "bg-cyan-500/10 text-cyan-400",
  image: "bg-rose-500/10 text-rose-400",
  file: "bg-violet-500/10 text-violet-400",
  collection: "", // uses color prop instead
};

const sizeClasses: Record<string, string> = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

const iconSizes: Record<string, string> = {
  sm: "h-[14px] w-[14px]",
  md: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
};

export function IconBadge({
  icon: Icon,
  variant,
  color,
  size = "md",
  className,
}: IconBadgeProps) {
  const colorClasses =
    variant === "collection" && color ? color : variantClasses[variant];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        colorClasses,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/icon-badge.tsx
git commit -m "feat: add IconBadge ui primitive"
```

### Task 10: Create ui/badge.tsx

**Files:**
- Create: `src/components/ui/badge.tsx`

**Purpose:** Text badge for labels and status

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface BadgeProps {
  variant?: "default" | "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: "bg-surface-container text-outline",
  primary: "bg-primary/10 text-primary",
  secondary: "text-outline bg-surface-container",
};

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/badge.tsx
git commit -m "feat: add Badge ui primitive"
```

---

## Phase 4: UI Primitives - Overlay Components

### Task 11: Create ui/modal.tsx

**Files:**
- Create: `src/components/ui/modal.tsx`

**Purpose:** Centered dialog overlay

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: "sm" | "md";
  ariaLabel?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "w-[360px]",
  md: "w-[400px]",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  size = "md",
  ariaLabel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        className={cn(
          "bg-surface-container-high rounded-xl p-6 mx-4 shadow-2xl",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
            <IconButton icon={X} size="sm" onClick={onClose} label="Close" />
          </div>
        )}
        {children}
        {actions && <div className="flex items-center justify-end gap-2 mt-6">{actions}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/modal.tsx
git commit -m "feat: add Modal ui primitive"
```

### Task 12: Create ui/drawer.tsx

**Files:**
- Create: `src/components/ui/drawer.tsx`

**Purpose:** Slide-out side panel

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./icon-button";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "md" | "lg";
}

const widthClasses: Record<string, string> = {
  md: "w-full md:w-[480px]",
  lg: "w-full md:w-[680px]",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = "lg",
}: DrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 flex flex-col z-50 bg-surface-container-low shadow-2xl",
          widthClasses[width]
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
            {title && <div className="flex-1">{title}</div>}
            <div className="flex items-center gap-2">
              <IconButton
                icon={X}
                onClick={onClose}
                label="Close drawer"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 gap-2">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/drawer.tsx
git commit -m "feat: add Drawer ui primitive"
```

### Task 13: Create ui/action-menu.tsx

**Files:**
- Create: `src/components/ui/action-menu.tsx`

**Purpose:** Dropdown menu with items (replaces inline dropdowns in cards)

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";

export interface ActionMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger";
  onClick: () => void;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger: React.ReactNode;
  align?: "left" | "right";
}

export function ActionMenu({
  items,
  trigger,
  align = "right",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setOpen(false), open);

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute top-full mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl border border-white/10 py-1 z-50",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors",
                  item.variant === "danger"
                    ? "text-error hover:bg-error/10"
                    : "text-on-surface-variant hover:bg-surface-bright"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/action-menu.tsx
git commit -m "feat: add ActionMenu ui primitive"
```

---

## Phase 5: UI Primitives - Remaining Components

### Task 14: Create ui/select.tsx

**Files:**
- Create: `src/components/ui/select.tsx`

**Purpose:** Dropdown select input

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface SelectProps<T> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  className,
}: SelectProps<T>) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      disabled={disabled}
      className={cn(
        "text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/select.tsx
git commit -m "feat: add Select ui primitive"
```

### Task 15: Create ui/alert.tsx

**Files:**
- Create: `src/components/ui/alert.tsx`

**Purpose:** Status/error message banner

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface AlertProps {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  error: "border-error/30 bg-error/10 text-error",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-2 text-xs",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/alert.tsx
git commit -m "feat: add Alert ui primitive"
```

### Task 16: Create ui/separator.tsx

**Files:**
- Create: `src/components/ui/separator.tsx`

**Purpose:** Divider line

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({
  orientation = "horizontal",
  className,
}: SeparatorProps) {
  return (
    <div
      className={cn(
        "bg-outline-variant/30",
        orientation === "horizontal" ? "h-px flex-1" : "w-px h-full",
        className
      )}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/separator.tsx
git commit -m "feat: add Separator ui primitive"
```

### Task 17: Create ui/avatar.tsx

**Files:**
- Create: `src/components/ui/avatar.tsx`

**Purpose:** User avatar with fallback initials

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initial = name?.charAt(0).toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full bg-surface-bright object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-container font-bold text-on-primary-container",
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/avatar.tsx
git commit -m "feat: add Avatar ui primitive"
```

### Task 18: Create ui/empty-state.tsx

**Files:**
- Create: `src/components/ui/empty-state.tsx`

**Purpose:** Empty list placeholder

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      <p className="text-xs text-outline">{message}</p>
      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/empty-state.tsx
git commit -m "feat: add EmptyState ui primitive"
```

### Task 19: Create ui/tabs.tsx

**Files:**
- Create: `src/components/ui/tabs.tsx`

**Purpose:** Filter/navigation tabs

- [ ] **Step 1: Write the component**

```typescript
"use client";

import { cn } from "@/lib/utils";

export interface TabOption {
  value: string | null;
  label: string;
}

export interface TabsProps {
  value: string | null;
  options: TabOption[];
  onChange: (value: string | null) => void;
  size?: "sm" | "md";
  className?: string;
}

export function Tabs({
  value,
  options,
  onChange,
  size = "sm",
  className,
}: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto", className)}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.label}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-outline hover:text-on-surface-variant hover:bg-surface-container"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/tabs.tsx
git commit -m "feat: add Tabs ui primitive"
```

---

## Phase 6: Domain Components - Assets

### Task 20: Create assets/asset-icon.tsx

**Files:**
- Create: `src/components/assets/asset-icon.tsx`
- Modify: Update imports in files that use TYPE_CONFIG for icons

**Purpose:** Lookup icon by asset type

- [ ] **Step 1: Write the component**

```typescript
import { TYPE_CONFIG } from "@/lib/asset-types";
import { AssetType } from "@/generated/prisma";

export interface AssetIconProps {
  type: AssetType;
  className?: string;
}

export function AssetIcon({ type, className }: AssetIconProps) {
  const Icon = TYPE_CONFIG[type].icon;
  return <Icon className={className} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/assets/asset-icon.tsx
git commit -m "feat: add AssetIcon component"
```

### Task 21: Create assets/asset-type-badge.tsx

**Files:**
- Create: `src/components/assets/asset-type-badge.tsx`

**Purpose:** Type indicator badge with icon

- [ ] **Step 1: Write the component**

```typescript
import { AssetType } from "@/generated/prisma";
import { TYPE_CONFIG } from "@/lib/asset-types";
import { Badge } from "@/components/ui/badge";

export interface AssetTypeBadgeProps {
  type: AssetType;
  showLabel?: boolean;
}

export function AssetTypeBadge({ type, showLabel = false }: AssetTypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.badge}`}>
      {showLabel ? config.label : type}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/assets/asset-type-badge.tsx
git commit -m "feat: add AssetTypeBadge component"
```

### Task 22: Refactor assets/asset-card.tsx

**Files:**
- Create: `src/components/assets/asset-card.tsx`
- Delete: `src/components/asset-card.tsx` (after confirming new one works)

**Purpose:** Refactor to use UI primitives

- [ ] **Step 1: Write the refactored component**

```typescript
"use client";

import { Pin, PinOff, Trash2, MoreVertical } from "lucide-react";
import { AssetType } from "@/generated/prisma";
import { TYPE_CONFIG } from "@/lib/asset-types";
import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { ActionMenu } from "@/components/ui/action-menu";
import { IconButton } from "@/components/ui/icon-button";

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

export function AssetCard({
  asset,
  onClick,
  onTogglePin,
  onDelete,
  compact = false,
}: AssetCardProps) {
  const config = TYPE_CONFIG[asset.type];
  const subtitle =
    asset.type === "SNIPPET" && asset.language
      ? `${config.label} • ${asset.language}`
      : config.label;

  const menuItems = [
    {
      id: "pin",
      label: asset.pinned ? "Unpin" : "Pin",
      icon: asset.pinned ? PinOff : Pin,
      onClick: onTogglePin,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "danger" as const,
      onClick: onDelete,
    },
  ];

  if (compact) {
    return (
      <Card
        hoverable
        onClick={onClick}
        padding="sm"
        className="flex items-center gap-3 hover:bg-surface-container group cursor-pointer"
      >
        <IconBadge
          icon={config.icon}
          variant={asset.type.toLowerCase() as any}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">
            {asset.title}
          </p>
          <p className="text-[10px] text-outline truncate">{subtitle}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hoverable
      onClick={onClick}
      padding="sm"
      className="flex items-center gap-4 hover:bg-surface-container-high group cursor-pointer"
    >
      <IconBadge
        icon={config.icon}
        variant={asset.type.toLowerCase() as any}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 truncate">
          {asset.title}
        </h4>
        <p className="text-[10px] text-outline font-mono truncate">{subtitle}</p>
      </div>
      <ActionMenu
        items={menuItems}
        trigger={
          <IconButton
            icon={MoreVertical}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            label="More actions"
          />
        }
      />
    </Card>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/ishak/Codebase/cellar && npx tsc --noEmit src/components/assets/asset-card.tsx
```

- [ ] **Step 3: Update imports in dashboard-client.tsx**

Change:
```typescript
import { AssetCard } from "@/components/asset-card";
```
To:
```typescript
import { AssetCard } from "@/components/assets/asset-card";
```

- [ ] **Step 4: Update imports in assets-client.tsx**

Change:
```typescript
import { AssetCard } from "@/components/asset-card";
```
To:
```typescript
import { AssetCard } from "@/components/assets/asset-card";
```

- [ ] **Step 5: Delete old file and commit**

```bash
rm src/components/asset-card.tsx
git add src/components/assets/asset-card.tsx src/components/asset-card.tsx src/app/(app)/dashboard/dashboard-client.tsx src/app/(app)/assets/assets-client.tsx
git commit -m "refactor: AssetCard now uses UI primitives"
```

---

## Phase 7: Domain Components - Collections

### Task 23: Refactor collections/collection-card.tsx

**Files:**
- Create: `src/components/collections/collection-card.tsx`
- Delete: `src/components/collection-card.tsx`

**Purpose:** Refactor to use UI primitives

- [ ] **Step 1: Write the refactored component**

```typescript
"use client";

import { Folder, Pin, PinOff, Trash2, MoreHorizontal } from "lucide-react";
import { getColorClasses } from "@/lib/colors";
import { Card } from "@/components/ui/card";
import { IconBadge } from "@/components/ui/icon-badge";
import { ActionMenu } from "@/components/ui/action-menu";
import { IconButton } from "@/components/ui/icon-button";

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

export function CollectionCard({
  collection,
  onClick,
  onTogglePin,
  onDelete,
}: CollectionCardProps) {
  const colorClasses = getColorClasses(collection.color);

  const menuItems = [
    {
      id: "pin",
      label: collection.pinned ? "Unpin" : "Pin",
      icon: collection.pinned ? PinOff : Pin,
      onClick: onTogglePin,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "danger" as const,
      onClick: onDelete,
    },
  ];

  return (
    <Card hoverable onClick={onClick} className="group cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <IconBadge
          icon={Folder}
          variant="collection"
          color={colorClasses}
          size="md"
        />
        <ActionMenu
          items={menuItems}
          trigger={
            <IconButton
              icon={MoreHorizontal}
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all"
              onClick={(e) => e.stopPropagation()}
              label="More actions"
            />
          }
        />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-200 truncate">
          {collection.name}
        </p>
        <p className="text-[10px] text-outline mt-0.5">
          {collection._count.assets} items
        </p>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Update imports**

Update `dashboard-client.tsx`:
```typescript
import { CollectionCard } from "@/components/collections/collection-card";
```

Update `collections-client.tsx`:
```typescript
import { CollectionCard } from "@/components/collections/collection-card";
```

- [ ] **Step 3: Delete old file and commit**

```bash
rm src/components/collection-card.tsx
git add src/components/collections/collection-card.tsx src/components/collection-card.tsx src/app/(app)/dashboard/dashboard-client.tsx src/app/(app)/collections/collections-client.tsx
git commit -m "refactor: CollectionCard now uses UI primitives"
```

---

## Phase 8: Layout Components

### Task 24: Move and refactor layout/sidebar.tsx

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Delete: `src/components/sidebar.tsx`

**Purpose:** Move to layout folder and use Avatar primitive

- [ ] **Step 1: Copy sidebar.tsx to new location with Avatar update**

Copy the existing `src/components/sidebar.tsx` to `src/components/layout/sidebar.tsx`, then update the Avatar section:

Find this section (around lines 158-167):
```typescript
{user.image ? (
  <img
    src={user.image}
    alt={user.name}
    className="h-8 w-8 rounded-full bg-surface-bright object-cover"
  />
) : (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
    {user.name?.charAt(0).toUpperCase()}
  </div>
)}
```

Replace with:
```typescript
import { Avatar } from "@/components/ui/avatar";
// ...
<Avatar src={user.image} name={user.name} size="sm" />
```

- [ ] **Step 2: Update imports in layout.tsx**

Update `src/app/(app)/layout.tsx`:
```typescript
import { Sidebar } from "@/components/layout/sidebar";
```

- [ ] **Step 3: Delete old file and commit**

```bash
rm src/components/sidebar.tsx
git add src/components/layout/sidebar.tsx src/components/sidebar.tsx src/app/(app)/layout.tsx
git commit -m "refactor: move Sidebar to layout folder, use Avatar primitive"
```

### Task 25: Move and refactor layout/header.tsx

**Files:**
- Create: `src/components/layout/header.tsx`
- Delete: `src/components/header.tsx`

**Purpose:** Move to layout folder and use Button/Input primitives

- [ ] **Step 1: Copy and refactor header.tsx**

Copy `src/components/header.tsx` to `src/components/layout/header.tsx`, then update:

Add imports:
```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

Replace the search input (around line 42-51):
```typescript
{/* Old */}
<input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="bg-surface-container-low border-none rounded-lg py-2 px-10 text-sm w-80 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/50 text-on-surface"
  placeholder="Quick search..."
  type="text"
/>

{/* New */}
<Input
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Quick search..."
  className="w-80 py-2 px-10"
/>
```

Replace the buttons (around lines 54-67):
```typescript
{/* Old */}
<button onClick={onAddCollection} className="...">...</button>
<button onClick={onAddItem} className="...">...</button>

{/* New */}
<Button variant="secondary" size="sm" onClick={onAddCollection}>
  <FolderPlus className="h-4 w-4" />
  <span className="hidden sm:inline">Collection</span>
</Button>
<Button variant="primary" size="sm" onClick={onAddItem}>
  <SquarePlus className="h-4 w-4" />
  <span className="hidden sm:inline">Add Item</span>
</Button>
```

- [ ] **Step 2: Update imports in app-shell.tsx**

Update `src/app/(app)/app-shell.tsx`:
```typescript
import { Header } from "@/components/layout/header";
```

- [ ] **Step 3: Delete old file and commit**

```bash
rm src/components/header.tsx
git add src/components/layout/header.tsx src/components/header.tsx src/app/(app)/app-shell.tsx
git commit -m "refactor: move Header to layout folder, use Button/Input primitives"
```

### Task 26: Move layout/app-shell.tsx

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Delete: `src/app/(app)/app-shell.tsx`

**Purpose:** Move to layout folder for consistency

- [ ] **Step 1: Copy app-shell.tsx to new location**

```bash
cp src/app/(app)/app-shell.tsx src/components/layout/app-shell.tsx
```

- [ ] **Step 2: Update imports in layout.tsx**

Update `src/app/(app)/layout.tsx`:
```typescript
import { AppShell } from "@/components/layout/app-shell";
```

- [ ] **Step 3: Delete old file and commit**

```bash
rm src/app/(app)/app-shell.tsx
git add src/components/layout/app-shell.tsx src/app/(app)/app-shell.tsx src/app/(app)/layout.tsx
git commit -m "refactor: move AppShell to layout folder"
```

---

## Phase 9: Shared Hooks for Client Pages

### Task 27: Create hooks/use-drawer-state.ts

**Files:**
- Create: `src/hooks/use-drawer-state.ts`

**Purpose:** Manage drawer state and selected item

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useState, useCallback } from "react";

export interface UseDrawerStateOptions<T> {
  onSaved?: () => void;
}

export interface DrawerState<T> {
  open: boolean;
  selected: T | null;
  mode: "view" | "edit" | "create";
  openView: (item: T) => void;
  openEdit: (item: T) => void;
  openCreate: (defaultItem?: Partial<T>) => void;
  close: () => void;
  setMode: (mode: "view" | "edit" | "create") => void;
  setSelected: (item: T | null) => void;
}

export function useDrawerState<T>(
  options?: UseDrawerStateOptions<T>
): DrawerState<T> {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");

  const openView = useCallback((item: T) => {
    setSelected(item);
    setMode("view");
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setSelected(item);
    setMode("edit");
    setOpen(true);
  }, []);

  const openCreate = useCallback((defaultItem?: Partial<T>) => {
    setSelected(defaultItem as T || null);
    setMode("create");
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setSelected(null);
    setMode("view");
  }, []);

  const handleSaved = useCallback(() => {
    close();
    options?.onSaved?.();
  }, [close, options]);

  return {
    open,
    selected,
    mode,
    openView,
    openEdit,
    openCreate,
    close,
    setMode,
    setSelected,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-drawer-state.ts
git commit -m "feat: add useDrawerState hook"
```

---

## Phase 10: Final Cleanup

### Task 28: Delete delete-dialog.tsx

**Files:**
- Delete: `src/components/delete-dialog.tsx`

**Purpose:** No longer needed - replaced by Modal + Alert

- [ ] **Step 1: Verify Modal can replace delete-dialog usage**

Check usages of DeleteDialog and ensure they can use Modal + Alert instead:

```bash
grep -r "DeleteDialog" src/
```

- [ ] **Step 2: Delete file**

```bash
rm src/components/delete-dialog.tsx
git add src/components/delete-dialog.tsx
git commit -m "chore: remove delete-dialog - replaced by Modal primitive"
```

### Task 29: Final TypeScript check

**Files:**
- All TypeScript files

**Purpose:** Ensure no type errors

- [ ] **Step 1: Run TypeScript check**

```bash
cd /Users/ishak/Codebase/cellar && npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 2: Run build check**

```bash
cd /Users/ishak/Codebase/cellar && npm run build
```

Expected: Build succeeds

- [ ] **Step 3: Commit any fixes**

If there were errors, fix them and commit:

```bash
git add -A
git commit -m "fix: resolve TypeScript errors from refactoring"
```

---

## Success Criteria Verification

- [ ] All 16 UI primitives created and in `src/components/ui/`
- [ ] All 8 domain components refactored in `src/components/assets/` and `src/components/collections/`
- [ ] 3 shared hooks created in `src/hooks/`
- [ ] 2 shared constant files created in `src/lib/`
- [ ] No duplicated TYPE_CONFIG or dropdown logic
- [ ] All buttons use Button component
- [ ] All inputs use Input component
- [ ] All client pages updated with correct imports
- [ ] Zero TypeScript errors (`npx tsc --noEmit`)
- [ ] Build succeeds (`npm run build`)
- [ ] Visual parity with original design

---

## Notes

- The `file-dropzone.tsx`, `monaco-editor.tsx`, and `markdown-preview.tsx` components are well-contained and don't need refactoring
- `quick-actions.tsx` may be refactored later if needed - it has specific layout needs
- All imports should use `@/` path alias for consistency
