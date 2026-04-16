# Storybook Integration Design Spec

**Date:** 2026-04-17
**Author:** OpenCode AI Agent
**Status:** Draft

---

## 1. Overview

This document specifies the integration of Storybook 10 into the Cellar Next.js project. The goal is to establish a component development environment that supports visual documentation, design system showcase, and visual regression testing.

### 1.1 Goals

- **Component Documentation:** Visual catalog of all UI components with their variants
- **Design System Showcase:** Branded environment for stakeholder review
- **Visual Testing:** Automated visual regression testing via Vitest addon
- **Developer Experience:** Fast feedback loop for component development

### 1.2 Non-Goals

- End-to-end testing (Playwright handles this)
- CI/CD integration (out of scope for this phase)
- React Server Component testing (experimental, skip for now)

---

## 2. Architecture

### 2.1 Framework Selection

**Selected Framework:** `@storybook/nextjs-vite`

**Rationale:**
- Recommended by Storybook 10 documentation
- Faster builds than Webpack version
- Better Vitest addon support
- Simpler configuration
- Native Vite support aligns with Next.js 16

**Comparison with alternatives:**
| Approach | Pros | Cons |
|----------|------|------|
| `@storybook/nextjs-vite` | Fast, modern, better test support | None for this project |
| `@storybook/nextjs` (Webpack) | Compatible with legacy Webpack configs | Slower, more complex |

### 2.2 Testing Strategy

**CRITICAL RULE - Testing Division:**

| Test Type | Tool | When to Use |
|-----------|------|-------------|
| **Visual states** (all component variants) | Storybook stories | Showing how component looks in different states |
| **Simple interactions** (click, hover, focus) | Storybook play functions | Visual interaction demos that stakeholders can see |
| **Complex logic** (validation, API calls, state) | Vitest | Logic verification, bulk test cases, edge cases |
| **Bulk scenarios** (20+ test cases) | Vitest | Data-driven tests, table-driven validation |
| **Visual regression** | Storybook Vitest addon | Catching accidental visual changes |

**Examples:**

```tsx
// GOOD: Vitest for logic testing
describe('Form validation', () => {
  it.each([
    { email: 'invalid', expected: false },
    { email: 'test@example.com', expected: true },
    { email: '', expected: false },
    { email: 'test@', expected: false },
  ])('validates email: $email', ({ email, expected }) => {
    const result = validateEmail(email);
    expect(result.isValid).toBe(expected);
  });
});

// GOOD: Storybook for visual demo
export const Loading: Story = {
  args: { loading: true, children: 'Save' },
  // Just shows the spinner - visual only, no play function
};

// GOOD: Storybook play for visual interaction
export const ModalOpens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Open Modal'));
    // Visual: "Did the modal slide in? Is the backdrop visible?"
    await expect(canvas.getByRole('dialog')).toBeVisible();
  },
};
```

**Testing Redundancy Rule:**
- Do NOT duplicate tests between Vitest and Storybook
- If a test checks className/render output → use Storybook
- If a test checks logic/behavior → use Vitest
- If a test needs visual feedback → use Storybook play

---

## 3. Installation & Configuration

### 3.1 Installation Method

**Command:** `npm create storybook@latest`

The CLI will:
1. Detect Next.js project automatically
2. Offer `@storybook/nextjs-vite` (accept this)
3. Install all dependencies
4. Create `.storybook/main.ts`, `.storybook/preview.tsx`
5. Add npm scripts
6. Create example stories

### 3.2 Post-CLI Configuration

**`.storybook/main.ts` (minimal tweaks):**
```typescript
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
};

export default config;
```

**`.storybook/preview.tsx` (Tailwind + App Router):**
```typescript
import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';  // Tailwind CSS

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,  // Required for next/navigation
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
          value: '#0f172a',  // Cellar surface-container-low
        },
      ],
    },
  },
};

export default preview;
```

**`.storybook/manager.ts` (Cellar branding):**
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

**`vitest.workspace.ts` (workspace config):**
```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'vitest.config.ts',
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

### 3.3 npm Scripts

Add to `package.json`:
```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "test-storybook": "vitest --project=storybook --run"
}
```

---

## 4. Story Organization

### 4.1 File Location

**Co-located with components:**
```
src/components/ui/
├── button.tsx
├── button.test.tsx
└── button.stories.tsx
```

**Rationale:**
- Stories next to component they document
- Easy to find and maintain
- Matches existing test file pattern

### 4.2 Story Format

**CSF 3 (Component Story Format 3)**

**Why CSF 3:**
- Industry standard, stable and well-documented
- Full TypeScript support
- Backwards compatible
- Works with all Storybook 10 features

**Alternative considered:** CSF Factories
- **Status:** Preview (not yet stable)
- **Decision:** Skip for now, can migrate later when it reaches stable

### 4.3 Example Story Structure

```tsx
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from '@storybook/test';
import { within, userEvent } from '@storybook/test';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  tags: ['autodocs'],
  parameters: {
    // Component-level parameters
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Visual states - no play function
export const Primary: Story = {
  args: { variant: 'primary', children: 'Button' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Button' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Button' },
};

// Interaction test - with play function
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

### 4.4 Component Coverage

**Priority 1: All UI components (20+ files)**
- Minimum: 1 story showing default state
- Tag: `['autodocs']` for automatic documentation

**Priority 2: Complex components**
- Button: All variants (primary, secondary, ghost, danger)
- Input: States (default, error, disabled, focused)
- Modal: Open/closed states
- Select: Options, disabled items, groups
- Tabs: Active, hover states

**Priority 3: Simple components**
- Separator, Label: Single story sufficient
- Badge: Variants only

---

## 5. Branding

### 5.1 Visual Identity

**Source:** `src/components/layout/sidebar.tsx`

**Brand Elements:**
- **Logo:** Package icon (Lucide) in rounded square with primary container background
- **Colors:**
  - Background: `surface-container-low` (`#0f172a`)
  - Primary: Indigo (`#6366f1`)
  - Secondary: Slate 400 (`#94a3b8`)
  - Text: Slate 100 (`#f1f5f9`)
- **Theme:** Dark only (no light variant)

### 5.2 Logo Asset

**File:** `public/cellar-logo.svg`

**Design:**
- Package icon from Lucide
- Rounded container matching sidebar style
- SVG format for scalability

---

## 6. Error Handling

### 6.1 Common Issues

**Issue 1: Next.js App Router hooks not working**
- **Symptom:** `usePathname`, `useRouter` errors
- **Fix:** Set `nextjs.appDirectory: true` in preview parameters

**Issue 2: Tailwind styles not applying**
- **Symptom:** Components render without styling
- **Fix:** Import `globals.css` in `.storybook/preview.tsx`

**Issue 3: Module mocking for Next.js imports**
- **Symptom:** Can't mock `next/navigation`
- **Fix:** Use `@storybook/nextjs-vite/navigation.mock`

**Issue 4: Path aliases not resolving**
- **Symptom:** `@/components/button` import fails
- **Fix:** Should work out of box with `@storybook/nextjs-vite`

### 6.2 Development Workflow

1. Run `npm run storybook` (starts dev server on :6006)
2. Create `.stories.tsx` file next to component
3. Write stories for all visual states
4. Add `play` functions for interaction testing (if needed)
5. Verify in Storybook UI
6. Run `npm run test-storybook` for regression testing

---

## 7. Implementation Checklist

### Phase 1: Setup
- [ ] Run `npm create storybook@latest`
- [ ] Select `@storybook/nextjs-vite` framework
- [ ] Verify `.storybook/main.ts` created
- [ ] Verify `.storybook/preview.tsx` created
- [ ] Add Tailwind import to preview.tsx
- [ ] Add `nextjs.appDirectory: true` parameter
- [ ] Configure dark theme backgrounds

### Phase 2: Branding
- [ ] Create `public/cellar-logo.svg`
- [ ] Create `.storybook/manager.ts` with Cellar theme
- [ ] Test theme renders correctly

### Phase 3: Stories
- [ ] Button component stories
- [ ] Input component stories
- [ ] Card component stories
- [ ] Modal component stories
- [ ] All remaining UI components

### Phase 4: Vitest Integration
- [ ] Create `vitest.workspace.ts`
- [ ] Add `test-storybook` script
- [ ] Verify tests run successfully
- [ ] Test coverage reporting (optional)

### Phase 5: Cleanup
- [ ] Remove redundant Vitest tests (className/render checks)
- [ ] Verify Vitest tests still pass for logic
- [ ] Document Storybook usage in README

---

## 8. Testing Decision Matrix

| Scenario | Tool | Example |
|----------|------|---------|
| Component renders correctly in all variants | Storybook stories | Button with primary, secondary, disabled states |
| Bulk validation logic (20+ cases) | Vitest | Email validation with many edge cases |
| Visual interaction demo | Storybook play | Modal opens, shows backdrop animation |
| API integration | Vitest | Form submission calls correct endpoint |
| Visual regression detection | Storybook Vitest addon | Screenshot comparison in CI |
| Component appears in design review | Storybook UI | Designer reviews Button variants |

---

## 9. Appendix

### 9.1 References

- [Storybook 10 Next.js Vite Framework](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite)
- [Storybook 10 Testing Guide](https://storybook.js.org/docs/writing-tests)
- [Vitest Workspace Config](https://vitest.dev/guide/workspace)

### 9.2 Dependencies

Auto-installed by CLI:
- `@storybook/nextjs-vite`
- `@storybook/react`
- `@storybook/addon-essentials`
- `@storybook/test`
- `storybook`

Manual verification needed:
- `@storybook/addon-vitest` (for Vitest addon)

---

**End of Document**
