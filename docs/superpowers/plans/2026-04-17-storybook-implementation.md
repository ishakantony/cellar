# Storybook Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Storybook 10 with Next.js Vite framework for Cellar's UI component documentation and visual testing.

**Architecture:** Storybook 10 with `@storybook/nextjs-vite` framework for fast builds, co-located CSF 3 stories, Cellar-branded dark theme, and hybrid testing with Vitest addon.

**Tech Stack:** Storybook 10, Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest

---

## File Structure

**New Files:**
- `.storybook/main.ts` - Storybook configuration
- `.storybook/preview.tsx` - Global decorators and parameters
- `.storybook/manager.ts` - Cellar branding theme
- `vitest.workspace.ts` - Vitest workspace configuration
- `public/cellar-logo.svg` - Cellar logo for Storybook UI
- `src/components/ui/button.stories.tsx` - Button component stories (example)
- (20+ additional `.stories.tsx` files for UI components)

**Modified Files:**
- `package.json` - Add Storybook npm scripts
- `.gitignore` - Ignore Storybook build output

---

## Phase 1: Storybook Setup

### Task 1: Install Storybook via CLI

**Files:**
- Create: Multiple files via CLI
- Modify: `package.json`

- [ ] **Step 1: Run Storybook CLI installer**

Run:
```bash
npm create storybook@latest
```

When prompted:
- Accept automatic detection of Next.js
- Choose `@storybook/nextjs-vite` framework
- Select "Yes" for onboarding tour (or "No" if experienced)
- Choose "Recommended" configuration

- [ ] **Step 2: Verify installation completed**

Check these files were created:
```bash
ls -la .storybook/
```

Expected output shows:
- `.storybook/main.ts`
- `.storybook/preview.ts` (or `.tsx`)

- [ ] **Step 3: Verify npm scripts added**

Check `package.json` contains:
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

- [ ] **Step 4: Run Storybook to verify it works**

Run:
```bash
npm run storybook
```

Expected: Storybook dev server starts on http://localhost:6006

- [ ] **Step 5: Stop Storybook and commit**

Press `Ctrl+C` to stop, then:
```bash
git add .
git commit -m "chore: install Storybook 10 with Next.js Vite framework"
```

---

## Phase 2: Post-CLI Configuration

### Task 2: Configure Storybook Main Config

**Files:**
- Modify: `.storybook/main.ts`

- [ ] **Step 1: Update main.ts with proper story patterns**

Replace contents of `.storybook/main.ts` with:

```typescript
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
};

export default config;
```

- [ ] **Step 2: Verify configuration is valid**

Run:
```bash
npm run storybook
```

Expected: Starts without errors

- [ ] **Step 3: Commit changes**

```bash
git add .storybook/main.ts
git commit -m "config: update Storybook main config for Next.js Vite"
```

---

### Task 3: Configure Storybook Preview (Tailwind + App Router)

**Files:**
- Modify: `.storybook/preview.ts` (or rename to `.tsx`)

- [ ] **Step 1: Check if preview.ts exists and rename if needed**

Run:
```bash
ls .storybook/preview*
```

If `.storybook/preview.ts` exists:
```bash
mv .storybook/preview.ts .storybook/preview.tsx
```

- [ ] **Step 2: Update preview.tsx with Tailwind and App Router config**

Replace contents of `.storybook/preview.tsx` with:

```typescript
import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'cellar-dark',
      values: [
        {
          name: 'cellar-dark',
          value: '#0f172a',
        },
      ],
    },
  },
};

export default preview;
```

- [ ] **Step 3: Verify globals.css exists at the path**

Run:
```bash
ls src/app/globals.css
```

Expected: File exists

- [ ] **Step 4: Run Storybook to verify Tailwind styles work**

Run:
```bash
npm run storybook
```

Open http://localhost:6006 and check that example stories have proper styling (if any example components use Tailwind classes).

- [ ] **Step 5: Commit changes**

```bash
git add .storybook/preview.tsx
git commit -m "config: add Tailwind CSS and App Router support to Storybook preview"
```

---

### Task 4: Create Cellar Branding Theme

**Files:**
- Create: `.storybook/manager.ts`
- Create: `public/cellar-logo.svg`

- [ ] **Step 1: Create manager.ts with Cellar theme**

Create `.storybook/manager.ts` with:

```typescript
import { create } from '@storybook/theming/create';
import { addons } from '@storybook/manager-api';

const cellarTheme = create({
  base: 'dark',
  
  brandTitle: 'Cellar',
  brandUrl: '/',
  brandImage: '/cellar-logo.svg',
  brandTarget: '_self',
  
  colorPrimary: '#6366f1',
  colorSecondary: '#94a3b8',
  
  appBg: '#0f172a',
  appContentBg: '#1e293b',
  appBorderColor: 'rgba(255,255,255,0.05)',
  textColor: '#f1f5f9',
  
  barTextColor: '#94a3b8',
  barSelectedColor: '#6366f1',
  barBg: '#0f172a',
});

addons.setConfig({
  theme: cellarTheme,
});
```

- [ ] **Step 2: Create cellar-logo.svg**

Create `public/cellar-logo.svg` with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m7.5 4.27 9 5.15"/>
  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
  <path d="m3.3 7 8.7 5 8.7-5"/>
  <path d="M12 22V12"/>
</svg>
```

- [ ] **Step 3: Run Storybook to verify branding**

Run:
```bash
npm run storybook
```

Verify:
- Cellar logo appears in top-left
- Dark theme is active
- Colors match Cellar branding (indigo accents)

- [ ] **Step 4: Commit branding changes**

```bash
git add .storybook/manager.ts public/cellar-logo.svg
git commit -m "feat: add Cellar branding to Storybook UI"
```

---

## Phase 3: Create Component Stories

### Task 5: Create Button Component Stories

**Files:**
- Create: `src/components/ui/button.stories.tsx`

- [ ] **Step 1: Read existing Button component**

Read `src/components/ui/button.tsx` to understand props and variants.

- [ ] **Step 2: Create button.stories.tsx**

Create `src/components/ui/button.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { within, userEvent } from '@storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span>→</span> With Icon
      </>
    ),
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
```

- [ ] **Step 3: Verify button stories work**

Run:
```bash
npm run storybook
```

Navigate to UI/Button stories and verify:
- All variants render correctly
- Controls work (change variant, size, disabled)
- Clickable story shows interaction

- [ ] **Step 4: Commit button stories**

```bash
git add src/components/ui/button.stories.tsx
git commit -m "feat: add Button component stories"
```

---

### Task 6: Create Input Component Stories

**Files:**
- Create: `src/components/ui/input.stories.tsx`

- [ ] **Step 1: Read existing Input component**

Read `src/components/ui/input.tsx` to understand props.

- [ ] **Step 2: Create input.stories.tsx**

Create `src/components/ui/input.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { within, userEvent } from '@storybook/test';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  component: Input,
  title: 'UI/Input',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Hello World',
    readOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Cannot edit',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Invalid input',
    'aria-invalid': true,
  },
};

export const Typable: Story = {
  args: {
    placeholder: 'Type here...',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, 'Hello Storybook');
    await expect(args.onChange).toHaveBeenCalled();
  },
};
```

- [ ] **Step 3: Verify and commit**

```bash
npm run storybook
```

Verify Input stories work, then:
```bash
git add src/components/ui/input.stories.tsx
git commit -m "feat: add Input component stories"
```

---

### Task 7: Create Stories for All Remaining UI Components

**Files:**
- Create: Multiple `.stories.tsx` files

List of components to create stories for:
- `icon-badge.tsx` → `icon-badge.stories.tsx`
- `tabs.tsx` → `tabs.stories.tsx`
- `card.tsx` → `card.stories.tsx`
- `action-menu.tsx` → `action-menu.stories.tsx`
- `empty-state.tsx` → `empty-state.stories.tsx`
- `label.tsx` → `label.stories.tsx`
- `drawer.tsx` → `drawer.stories.tsx`
- `alert.tsx` → `alert.stories.tsx`
- `icon-button.tsx` → `icon-button.stories.tsx`
- `avatar.tsx` → `avatar.stories.tsx`
- `badge.tsx` → `badge.stories.tsx`
- `separator.tsx` → `separator.stories.tsx`
- `modal.tsx` → `modal.stories.tsx`
- `select.tsx` → `select.stories.tsx`

For each component:

- [ ] **Step 1: Read the component file**

- [ ] **Step 2: Create minimal stories showing key variants**

Template:
```tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentName } from './component-name';

const meta: Meta<typeof ComponentName> = {
  component: ComponentName,
  title: 'UI/ComponentName',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {
    // Component props
  },
};

// Add variant stories based on component
```

- [ ] **Step 3: Verify in Storybook**

- [ ] **Step 4: Commit all component stories**

```bash
git add src/components/ui/*.stories.tsx
git commit -m "feat: add stories for all UI components"
```

---

## Phase 4: Vitest Integration

### Task 8: Configure Vitest Workspace

**Files:**
- Create: `vitest.workspace.ts`

- [ ] **Step 1: Check existing vitest.config.ts**

Read `vitest.config.ts` to understand current configuration.

- [ ] **Step 2: Create vitest.workspace.ts**

Create `vitest.workspace.ts` with:

```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Default Vitest config for unit tests
  'vitest.config.ts',
  
  // Storybook tests
  {
    test: {
      name: 'storybook',
      include: ['src/**/*.stories.@(js|jsx|ts|tsx)'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
      },
    },
  },
]);
```

- [ ] **Step 3: Add test-storybook script to package.json**

Modify `package.json` scripts section, add:
```json
{
  "scripts": {
    "test-storybook": "vitest --project=storybook --run"
  }
}
```

- [ ] **Step 4: Install Playwright if not present**

Run:
```bash
npm list @playwright/test || npm install --save-dev @playwright/test
```

- [ ] **Step 5: Verify workspace config works**

Run:
```bash
npm run test-storybook
```

Expected: Tests run (may not have stories yet, but config should work)

- [ ] **Step 6: Commit workspace config**

```bash
git add vitest.workspace.ts package.json
git commit -m "config: add Vitest workspace for Storybook testing"
```

---

## Phase 5: Cleanup and Documentation

### Task 9: Remove Redundant Vitest Tests

**Files:**
- Modify: `src/components/ui/button.test.tsx`
- Modify: Other `.test.tsx` files

- [ ] **Step 1: Read existing button.test.tsx**

Read `src/components/ui/button.test.tsx` and identify tests to remove.

- [ ] **Step 2: Identify redundant tests**

Tests to REMOVE (now covered by Storybook):
- Tests checking className/render output
- Tests checking component structure
- Visual state tests

Tests to KEEP (logic testing):
- Tests checking onClick behavior
- Tests checking complex interactions

- [ ] **Step 3: Update button.test.tsx**

Keep only logic tests. Example of cleaned test:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 4: Verify tests still pass**

Run:
```bash
npm run test
```

Expected: All Vitest tests pass

- [ ] **Step 5: Commit cleanup**

```bash
git add src/components/ui/button.test.tsx
git commit -m "refactor: remove redundant visual tests from Vitest (now in Storybook)"
```

- [ ] **Step 6: Repeat for other test files**

Clean up these test files similarly:
- `input.test.tsx`
- `card.test.tsx`
- `tabs.test.tsx`

- [ ] **Step 7: Final test verification**

Run:
```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 8: Commit all cleanup**

```bash
git add src/components/ui/*.test.tsx
git commit -m "refactor: clean up redundant tests across all UI components"
```

---

### Task 10: Update .gitignore

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add Storybook build output to gitignore**

Add to `.gitignore`:
```
# Storybook
storybook-static
```

- [ ] **Step 2: Commit gitignore update**

```bash
git add .gitignore
git commit -m "chore: ignore Storybook build output"
```

---

### Task 11: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm run test
npm run test-storybook
```

Expected: Both pass

- [ ] **Step 2: Build Storybook**

```bash
npm run build-storybook
```

Expected: Build succeeds, output in `storybook-static/`

- [ ] **Step 3: Run Storybook dev server**

```bash
npm run storybook
```

Verify:
- All 20+ components have stories
- Cellar branding is visible
- Dark theme is active
- Controls work for interactive components

- [ ] **Step 4: Final commit**

```bash
git commit --allow-empty -m "feat: complete Storybook 10 integration"
```

---

## Summary

**Completed Deliverables:**
1. Storybook 10 with `@storybook/nextjs-vite` framework
2. Cellar-branded dark theme (manager.ts, logo)
3. Co-located CSF 3 stories for all 20+ UI components
4. Vitest workspace for Storybook testing
5. Cleaned up redundant Vitest tests
6. npm scripts: `storybook`, `build-storybook`, `test-storybook`

**Files Created:**
- `.storybook/main.ts`
- `.storybook/preview.tsx`
- `.storybook/manager.ts`
- `vitest.workspace.ts`
- `public/cellar-logo.svg`
- `src/components/ui/*.stories.tsx` (20+ files)

**Files Modified:**
- `package.json` (scripts added)
- `.gitignore` (Storybook build ignored)
- `src/components/ui/*.test.tsx` (redundant tests removed)

---

**End of Implementation Plan**
