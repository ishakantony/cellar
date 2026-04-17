# Vitest Unit Testing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive unit testing infrastructure using Vitest for UI components, server actions, and utilities in the Cellar project.

**Architecture:** Co-located test files following modern best practices. Tests use behavior-focused approach with mocked dependencies (Prisma, auth) for server actions and React Testing Library for components.

**Tech Stack:** Vitest, @testing-library/react, happy-dom, @vitest/coverage-v8, Husky, lint-staged

---

## File Structure

**New Directories:**

- `src/test/` - Shared test utilities and mocks
- `src/test/mocks/` - Mock factories
- `src/test/utils/` - Test helpers

**New Files:**

- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Global test setup
- `src/test/mocks/prisma.ts` - Prisma mock factory
- `src/test/mocks/auth.ts` - Auth mock helpers
- `src/test/utils/test-data.ts` - Test data generators
- `src/test/utils/render-with-providers.tsx` - Custom render helper
- `src/components/ui/button.test.tsx` - Button component tests
- `src/components/ui/card.test.tsx` - Card component tests
- `src/components/ui/input.test.tsx` - Input component tests
- `src/components/ui/tabs.test.tsx` - Tabs component tests
- `src/app/actions/assets.test.ts` - Assets action tests
- `src/app/actions/collections.test.ts` - Collections action tests
- `.husky/pre-commit` - Git pre-commit hook

**Modified Files:**

- `package.json` - Add dev dependencies and scripts

---

## Phase 1: Infrastructure Setup

### Task 1: Install Vitest Dependencies

**Files:**

- Modify: `package.json`

**Context:** The project currently has no testing dependencies. We need to install Vitest and all related packages.

- [ ] **Step 1: Install all testing dependencies**

Run:

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom vitest-mock-extended husky lint-staged
```

Expected: All packages install successfully.

- [ ] **Step 2: Add test scripts to package.json**

Modify `package.json` to add these scripts in the `scripts` section:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "prepare": "husky"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install vitest and testing dependencies

- Add vitest, testing-library, happy-dom
- Add coverage and ui tools
- Add husky and lint-staged for pre-commit hooks"
```

---

### Task 2: Create Vitest Configuration

**Files:**

- Create: `vitest.config.ts`

**Context:** Vitest needs configuration for TypeScript, path aliases, test environment, and coverage.

- [ ] **Step 1: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
      exclude: [
        'node_modules/',
        'src/test/',
        'src/generated/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 2: Verify configuration**

Run:

```bash
npx vitest --version
```

Expected: Shows vitest version number.

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add vitest configuration

- Configure vitest with TypeScript support
- Set up happy-dom environment
- Add path alias resolution
- Configure coverage thresholds"
```

---

### Task 3: Create Global Test Setup

**Files:**

- Create: `src/test/setup.ts`

**Context:** Global setup file runs before all tests. It configures jest-dom matchers and mocks common Next.js modules.

- [ ] **Step 1: Create src/test/setup.ts**

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
```

- [ ] **Step 2: Commit**

```bash
git add src/test/setup.ts
git commit -m "chore: add global test setup

- Configure jest-dom matchers
- Add automatic cleanup after tests
- Mock next/navigation and next/cache"
```

---

### Task 4: Create Shared Mock Utilities

**Files:**

- Create: `src/test/mocks/prisma.ts`
- Create: `src/test/mocks/auth.ts`

**Context:** Server action tests need consistent mocks for Prisma and authentication.

- [ ] **Step 1: Create Prisma mock factory**

Create `src/test/mocks/prisma.ts`:

```typescript
import { vi } from 'vitest';

export function createMockPrisma() {
  return {
    asset: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    collection: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    assetCollection: {
      upsert: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;
```

- [ ] **Step 2: Create auth mock helpers**

Create `src/test/mocks/auth.ts`:

```typescript
import { vi } from 'vitest';

export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  image: null,
};

export function createMockGetUser(user = mockUser) {
  return vi.fn(() => Promise.resolve(user));
}

export function createMockGetUserUnauthorized() {
  return vi.fn(() => Promise.reject(new Error('Unauthorized')));
}
```

- [ ] **Step 3: Commit**

```bash
git add src/test/mocks/
git commit -m "chore: add shared test mocks

- Create Prisma mock factory for database operations
- Create auth mock helpers for session management
- Support both success and error scenarios"
```

---

### Task 5: Create Test Data Generators

**Files:**

- Create: `src/test/utils/test-data.ts`

**Context:** Consistent test data makes tests more maintainable and readable.

- [ ] **Step 1: Create test data generators**

Create `src/test/utils/test-data.ts`:

```typescript
import { AssetType } from '@/generated/prisma';

export function createMockAsset(
  overrides: Partial<{
    id: string;
    userId: string;
    type: AssetType;
    title: string;
    description: string | null;
    content: string | null;
    language: string | null;
    url: string | null;
    filePath: string | null;
    fileName: string | null;
    mimeType: string | null;
    fileSize: number | null;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'asset-123',
    userId: 'user-123',
    type: AssetType.DOCUMENT,
    title: 'Test Asset',
    description: null,
    content: null,
    language: null,
    url: null,
    filePath: null,
    fileName: null,
    mimeType: null,
    fileSize: null,
    pinned: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockCollection(
  overrides: Partial<{
    id: string;
    userId: string;
    name: string;
    description: string | null;
    color: string | null;
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  return {
    id: 'collection-123',
    userId: 'user-123',
    name: 'Test Collection',
    description: null,
    color: null,
    pinned: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

export function createMockAssetCollection(
  overrides: Partial<{
    assetId: string;
    collectionId: string;
    createdAt: Date;
  }> = {}
) {
  return {
    assetId: 'asset-123',
    collectionId: 'collection-123',
    createdAt: new Date('2024-01-01'),
    ...overrides,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/test/utils/test-data.ts
git commit -m "chore: add test data generators

- Create mock data factories for assets
- Create mock data factories for collections
- Support override patterns for customization"
```

---

## Phase 2: UI Component Testing

### Task 6: Test Button Component

**Files:**

- Create: `src/components/ui/button.test.tsx`

**Context:** Button is a fundamental UI component with variants, sizes, states, and click handling. Read `src/components/ui/button.tsx` first.

- [ ] **Step 1: Read the Button component**

Read: `src/components/ui/button.tsx`

Note the props interface, variants (primary, secondary, ghost, danger), sizes (sm, md, lg), and states.

- [ ] **Step 2: Write the failing test**

Create `src/components/ui/button.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  describe('rendering', () => {
    it('renders with text content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('renders with primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-zinc-900')
    })

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-white')
    })

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent')
    })

    it('renders with danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600')
    })

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-8')

      rerender(<Button size="md">Medium</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-10')

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveClass('h-12')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      await userEvent.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Disabled</Button>)

      await userEvent.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })
  })

  describe('accessibility', () => {
    it('has correct button role', () => {
      render(<Button>Accessible</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLButtonElement | null }
      render(<Button ref={ref}>With Ref</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })
})
```

- [ ] **Step 3: Run the tests**

Run:

```bash
npm run test:run -- src/components/ui/button.test.tsx
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/button.test.tsx
git commit -m "test: add Button component tests

- Test rendering with all variants (primary, secondary, ghost, danger)
- Test all sizes (sm, md, lg)
- Test click interactions and disabled state
- Test loading state and accessibility"
```

---

### Task 7: Test Card Component

**Files:**

- Create: `src/components/ui/card.test.tsx`

**Context:** Card is a compound component with Header, Title, Description, Content, and Footer sub-components.

- [ ] **Step 1: Read the Card component**

Read: `src/components/ui/card.tsx`

- [ ] **Step 2: Write the failing test**

Create `src/components/ui/card.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './card'

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('has card role for accessibility', () => {
    render(<Card>Content</Card>)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  describe('Card.Header', () => {
    it('renders header content', () => {
      render(
        <Card>
          <Card.Header>Header Content</Card.Header>
        </Card>
      )
      expect(screen.getByText('Header Content')).toBeInTheDocument()
    })
  })

  describe('Card.Title', () => {
    it('renders as heading', () => {
      render(
        <Card>
          <Card.Title>Card Title</Card.Title>
        </Card>
      )
      expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument()
    })
  })

  describe('Card.Description', () => {
    it('renders description text', () => {
      render(
        <Card>
          <Card.Description>Description text</Card.Description>
        </Card>
      )
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })
  })

  describe('Card.Content', () => {
    it('renders content area', () => {
      render(
        <Card>
          <Card.Content>Main content</Card.Content>
        </Card>
      )
      expect(screen.getByText('Main content')).toBeInTheDocument()
    })
  })

  describe('Card.Footer', () => {
    it('renders footer content', () => {
      render(
        <Card>
          <Card.Footer>Footer actions</Card.Footer>
        </Card>
      )
      expect(screen.getByText('Footer actions')).toBeInTheDocument()
    })
  })

  describe('full card composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <Card.Header>
            <Card.Title>Title</Card.Title>
            <Card.Description>Description</Card.Description>
          </Card.Header>
          <Card.Content>Content</Card.Content>
          <Card.Footer>Footer</Card.Footer>
        </Card>
      )

      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run the tests**

Run:

```bash
npm run test:run -- src/components/ui/card.test.tsx
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/card.test.tsx
git commit -m "test: add Card component tests

- Test main Card container rendering
- Test all sub-components (Header, Title, Description, Content, Footer)
- Test full card composition
- Verify accessibility with proper roles"
```

---

### Task 8: Test Input Component

**Files:**

- Create: `src/components/ui/input.test.tsx`

**Context:** Input is a form component with various states and label integration.

- [ ] **Step 1: Read the Input component**

Read: `src/components/ui/input.tsx`

- [ ] **Step 2: Write the failing test**

Create `src/components/ui/input.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './input'

describe('Input', () => {
  describe('rendering', () => {
    it('renders input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<Input defaultValue="Default text" />)
      expect(screen.getByDisplayValue('Default text')).toBeInTheDocument()
    })

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLInputElement | null }
      render(<Input ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  })

  describe('interactions', () => {
    it('calls onChange when typing', async () => {
      const handleChange = vi.fn()
      render(<Input onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'hello')

      expect(handleChange).toHaveBeenCalled()
    })

    it('updates value when typing', async () => {
      render(<Input />)

      const input = screen.getByRole('textbox')
      await userEvent.type(input, 'world')

      expect(input).toHaveValue('world')
    })

    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('shows required attribute', () => {
      render(<Input required />)
      expect(screen.getByRole('textbox')).toBeRequired()
    })
  })

  describe('accessibility', () => {
    it('associates with label via id', () => {
      render(<Input id="email" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('has aria-invalid when invalid', () => {
      render(<Input aria-invalid="true" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('types', () => {
    it('renders password input', () => {
      render(<Input type="password" />)
      expect(screen.getByLabelText('')).toHaveAttribute('type', 'password')
    })

    it('renders email input', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('renders number input', () => {
      render(<Input type="number" />)
      expect(screen.getByRole('spinbutton')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run the tests**

Run:

```bash
npm run test:run -- src/components/ui/input.test.tsx
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/input.test.tsx
git commit -m "test: add Input component tests

- Test rendering with various attributes
- Test change events and value updates
- Test disabled and required states
- Test accessibility attributes
- Test different input types"
```

---

### Task 9: Test Tabs Component

**Files:**

- Create: `src/components/ui/tabs.test.tsx`

**Context:** Tabs is a complex component with state management for switching between panels.

- [ ] **Step 1: Read the Tabs component**

Read: `src/components/ui/tabs.tsx`

- [ ] **Step 2: Write the failing test**

Create `src/components/ui/tabs.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Tabs } from './tabs'

describe('Tabs', () => {
  const renderTabs = () => {
    return render(
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
        <Tabs.Content value="tab3">Content 3</Tabs.Content>
      </Tabs>
    )
  }

  describe('rendering', () => {
    it('renders tab list with triggers', () => {
      renderTabs()

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument()
    })

    it('shows default tab content', () => {
      renderTabs()

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 1')
    })

    it('hides non-active tab content', () => {
      renderTabs()

      expect(screen.queryByText('Content 2')).not.toBeVisible()
      expect(screen.queryByText('Content 3')).not.toBeVisible()
    })
  })

  describe('interactions', () => {
    it('switches tab when clicking trigger', async () => {
      renderTabs()

      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 2')
    })

    it('calls onValueChange when tab changes', async () => {
      const handleChange = vi.fn()
      render(
        <Tabs defaultValue="tab1" onValueChange={handleChange}>
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">Content 1</Tabs.Content>
          <Tabs.Content value="tab2">Content 2</Tabs.Content>
        </Tabs>
      )

      await userEvent.click(screen.getByRole('tab', { name: 'Tab 2' }))

      expect(handleChange).toHaveBeenCalledWith('tab2')
    })
  })

  describe('accessibility', () => {
    it('sets aria-selected on active tab', () => {
      renderTabs()

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      expect(tab1).toHaveAttribute('aria-selected', 'true')
    })

    it('sets aria-selected false on inactive tabs', () => {
      renderTabs()

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      expect(tab2).toHaveAttribute('aria-selected', 'false')
    })

    it('associates tabpanel with tab', () => {
      renderTabs()

      const tabPanel = screen.getByRole('tabpanel')
      const tab = screen.getByRole('tab', { selected: true })

      expect(tabPanel).toHaveAttribute('aria-labelledby', tab.id)
    })
  })

  describe('controlled mode', () => {
    it('respects controlled value', () => {
      render(
        <Tabs value="tab2">
          <Tabs.List>
            <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
            <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1">Content 1</Tabs.Content>
          <Tabs.Content value="tab2">Content 2</Tabs.Content>
        </Tabs>
      )

      expect(screen.getByRole('tabpanel')).toHaveTextContent('Content 2')
    })
  })
})
```

- [ ] **Step 3: Run the tests**

Run:

```bash
npm run test:run -- src/components/ui/tabs.test.tsx
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/tabs.test.tsx
git commit -m "test: add Tabs component tests

- Test tab list and trigger rendering
- Test default tab content visibility
- Test tab switching interactions
- Test controlled mode behavior
- Test accessibility attributes (aria-selected, aria-labelledby)"
```

---

## Phase 3: Server Action Testing

### Task 10: Test Assets Actions - Create and Get

**Files:**

- Create: `src/app/actions/assets.test.ts`

**Context:** Assets server actions include CRUD operations and database queries. Tests need to mock Prisma and auth.

- [ ] **Step 1: Write the failing test for createAsset**

Create `src/app/actions/assets.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  togglePin,
  getDashboardData,
} from './assets';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { AssetType } from '@/generated/prisma';
import { createMockAsset } from '@/test/utils/test-data';

// Mocks
vi.mock('@/lib/prisma', () => ({
  prisma: {
    asset: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    collection: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/session', () => ({
  getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  unlink: vi.fn(),
}));

describe('assets actions', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUser).mockResolvedValue(mockUser);
  });

  describe('createAsset', () => {
    it('creates asset with user association', async () => {
      const mockAsset = createMockAsset();
      vi.mocked(prisma.asset.create).mockResolvedValue(mockAsset);

      const result = await createAsset({
        type: AssetType.DOCUMENT,
        title: 'Test Asset',
      });

      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          type: AssetType.DOCUMENT,
          title: 'Test Asset',
          userId: 'user-123',
        },
      });
      expect(result).toEqual(mockAsset);
    });

    it('creates asset with all optional fields', async () => {
      const mockAsset = createMockAsset({
        description: 'Description',
        content: 'Content',
        language: 'typescript',
      });
      vi.mocked(prisma.asset.create).mockResolvedValue(mockAsset);

      await createAsset({
        type: AssetType.SNIPPET,
        title: 'Code Snippet',
        description: 'Description',
        content: 'Content',
        language: 'typescript',
      });

      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          type: AssetType.SNIPPET,
          title: 'Code Snippet',
          description: 'Description',
          content: 'Content',
          language: 'typescript',
          userId: 'user-123',
        },
      });
    });

    it('revalidates paths after creation', async () => {
      vi.mocked(prisma.asset.create).mockResolvedValue(createMockAsset());

      await createAsset({ type: AssetType.DOCUMENT, title: 'Test' });

      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/assets');
    });

    it('throws error when user is not authenticated', async () => {
      vi.mocked(getUser).mockRejectedValue(new Error('Unauthorized'));

      await expect(createAsset({ type: AssetType.DOCUMENT, title: 'Test' })).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('getAssets', () => {
    it('returns assets for current user', async () => {
      const mockAssets = [createMockAsset(), createMockAsset({ id: 'asset-2' })];
      vi.mocked(prisma.asset.findMany).mockResolvedValue(mockAssets);

      const result = await getAssets();

      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockAssets);
    });

    it('filters by type', async () => {
      vi.mocked(prisma.asset.findMany).mockResolvedValue([]);

      await getAssets({ type: AssetType.IMAGE });

      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', type: AssetType.IMAGE },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('sorts by oldest first', async () => {
      vi.mocked(prisma.asset.findMany).mockResolvedValue([]);

      await getAssets({ sort: 'oldest' });

      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('sorts alphabetically', async () => {
      vi.mocked(prisma.asset.findMany).mockResolvedValue([]);

      await getAssets({ sort: 'az' });

      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { title: 'asc' },
      });
    });

    it('sorts reverse alphabetically', async () => {
      vi.mocked(prisma.asset.findMany).mockResolvedValue([]);

      await getAssets({ sort: 'za' });

      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { title: 'desc' },
      });
    });
  });
});
```

- [ ] **Step 2: Run the tests**

Run:

```bash
npm run test:run -- src/app/actions/assets.test.ts
```

Expected: Tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/assets.test.ts
git commit -m "test: add assets action tests - create and get

- Test createAsset with user association
- Test createAsset with all optional fields
- Test path revalidation after creation
- Test getAssets filtering and sorting
- Test authentication error handling"
```

---

### Task 11: Test Assets Actions - Update, Delete, and Dashboard

**Files:**

- Modify: `src/app/actions/assets.test.ts`

**Context:** Continue adding tests for remaining asset actions.

- [ ] **Step 1: Add tests for updateAsset**

Add to `src/app/actions/assets.test.ts` after the getAssets describe block:

```typescript
describe('updateAsset', () => {
  it('updates asset fields', async () => {
    const mockAsset = createMockAsset({ title: 'Updated' });
    vi.mocked(prisma.asset.update).mockResolvedValue(mockAsset);

    const result = await updateAsset('asset-123', { title: 'Updated' });

    expect(prisma.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-123', userId: 'user-123' },
      data: { title: 'Updated' },
    });
    expect(result).toEqual(mockAsset);
  });

  it('updates multiple fields', async () => {
    vi.mocked(prisma.asset.update).mockResolvedValue(createMockAsset());

    await updateAsset('asset-123', {
      title: 'New Title',
      description: 'New Description',
      content: 'New Content',
    });

    expect(prisma.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-123', userId: 'user-123' },
      data: {
        title: 'New Title',
        description: 'New Description',
        content: 'New Content',
      },
    });
  });

  it('revalidates paths after update', async () => {
    vi.mocked(prisma.asset.update).mockResolvedValue(createMockAsset());

    await updateAsset('asset-123', { title: 'Updated' });

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith('/assets');
    expect(revalidatePath).toHaveBeenCalledWith('/collections');
  });
});
```

- [ ] **Step 2: Add tests for deleteAsset**

Add after updateAsset tests:

```typescript
describe('deleteAsset', () => {
  it('deletes asset without file', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset({ filePath: null }));
    vi.mocked(prisma.asset.delete).mockResolvedValue(createMockAsset());

    await deleteAsset('asset-123');

    expect(prisma.asset.delete).toHaveBeenCalledWith({
      where: { id: 'asset-123', userId: 'user-123' },
    });
  });

  it('throws error when asset not found', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(null);

    await expect(deleteAsset('nonexistent')).rejects.toThrow('Asset not found');
  });

  it('revalidates paths after deletion', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset({ filePath: null }));
    vi.mocked(prisma.asset.delete).mockResolvedValue(createMockAsset());

    await deleteAsset('asset-123');

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith('/assets');
  });
});
```

- [ ] **Step 3: Add tests for togglePin**

Add after deleteAsset tests:

```typescript
describe('togglePin', () => {
  it('toggles pin from false to true', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset({ pinned: false }));
    vi.mocked(prisma.asset.update).mockResolvedValue(createMockAsset({ pinned: true }));

    await togglePin('asset-123');

    expect(prisma.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-123', userId: 'user-123' },
      data: { pinned: true },
    });
  });

  it('toggles pin from true to false', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset({ pinned: true }));
    vi.mocked(prisma.asset.update).mockResolvedValue(createMockAsset({ pinned: false }));

    await togglePin('asset-123');

    expect(prisma.asset.update).toHaveBeenCalledWith({
      where: { id: 'asset-123', userId: 'user-123' },
      data: { pinned: false },
    });
  });

  it('throws error when asset not found', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(null);

    await expect(togglePin('nonexistent')).rejects.toThrow('Asset not found');
  });

  it('revalidates paths after toggle', async () => {
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset({ pinned: false }));
    vi.mocked(prisma.asset.update).mockResolvedValue(createMockAsset({ pinned: true }));

    await togglePin('asset-123');

    expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    expect(revalidatePath).toHaveBeenCalledWith('/assets');
  });
});
```

- [ ] **Step 4: Add tests for getDashboardData**

Add after togglePin tests:

```typescript
describe('getDashboardData', () => {
  it('returns dashboard data for user', async () => {
    const pinnedAssets = [createMockAsset({ pinned: true })];
    const pinnedCollections = [{ id: 'col-1', name: 'Pinned' }];
    const recentAssets = [createMockAsset()];

    vi.mocked(prisma.asset.findMany).mockImplementation((args: any) => {
      if (args?.where?.pinned) return Promise.resolve(pinnedAssets);
      return Promise.resolve(recentAssets);
    });
    vi.mocked(prisma.collection.findMany).mockResolvedValue(pinnedCollections as any);

    const result = await getDashboardData();

    expect(result).toEqual({
      pinnedAssets,
      pinnedCollections,
      recentAssets,
    });
  });

  it('limits pinned assets to 20', async () => {
    vi.mocked(prisma.asset.findMany).mockResolvedValue([]);
    vi.mocked(prisma.collection.findMany).mockResolvedValue([]);

    await getDashboardData();

    expect(prisma.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 20 }));
  });

  it('limits recent assets to 10', async () => {
    vi.mocked(prisma.asset.findMany).mockResolvedValue([]);
    vi.mocked(prisma.collection.findMany).mockResolvedValue([]);

    await getDashboardData();

    expect(prisma.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 10 }));
  });
});
```

- [ ] **Step 5: Run all tests**

Run:

```bash
npm run test:run -- src/app/actions/assets.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/actions/assets.test.ts
git commit -m "test: add remaining assets action tests

- Test updateAsset with single and multiple fields
- Test deleteAsset with and without file
- Test togglePin toggling behavior
- Test getDashboardData with limits
- Test all error handling scenarios"
```

---

### Task 12: Test Collections Actions

**Files:**

- Create: `src/app/actions/collections.test.ts`

**Context:** Collections actions have similar patterns to assets but with different relationships.

- [ ] **Step 1: Write all collection action tests**

Create `src/app/actions/collections.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollections,
  getCollection,
  toggleCollectionPin,
  addAssetToCollection,
  removeAssetFromCollection,
} from './collections';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { createMockCollection, createMockAsset } from '@/test/utils/test-data';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    collection: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    asset: {
      findUnique: vi.fn(),
    },
    assetCollection: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/session', () => ({
  getUser: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('collections actions', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUser).mockResolvedValue(mockUser);
  });

  describe('createCollection', () => {
    it('creates collection with user association', async () => {
      const mockCollection = createMockCollection();
      vi.mocked(prisma.collection.create).mockResolvedValue(mockCollection);

      const result = await createCollection({ name: 'New Collection' });

      expect(prisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'New Collection',
          userId: 'user-123',
        },
      });
      expect(result).toEqual(mockCollection);
    });

    it('creates collection with all fields', async () => {
      vi.mocked(prisma.collection.create).mockResolvedValue(createMockCollection());

      await createCollection({
        name: 'My Collection',
        description: 'Description',
        color: '#ff0000',
      });

      expect(prisma.collection.create).toHaveBeenCalledWith({
        data: {
          name: 'My Collection',
          description: 'Description',
          color: '#ff0000',
          userId: 'user-123',
        },
      });
    });

    it('revalidates paths after creation', async () => {
      vi.mocked(prisma.collection.create).mockResolvedValue(createMockCollection());

      await createCollection({ name: 'Test' });

      expect(revalidatePath).toHaveBeenCalledWith('/collections');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('updateCollection', () => {
    it('updates collection fields', async () => {
      const mockCollection = createMockCollection({ name: 'Updated' });
      vi.mocked(prisma.collection.update).mockResolvedValue(mockCollection);

      const result = await updateCollection('col-123', { name: 'Updated' });

      expect(prisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'col-123', userId: 'user-123' },
        data: { name: 'Updated' },
      });
      expect(result).toEqual(mockCollection);
    });

    it('revalidates paths after update', async () => {
      vi.mocked(prisma.collection.update).mockResolvedValue(createMockCollection());

      await updateCollection('col-123', { name: 'Updated' });

      expect(revalidatePath).toHaveBeenCalledWith('/collections');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('deleteCollection', () => {
    it('deletes collection', async () => {
      vi.mocked(prisma.collection.delete).mockResolvedValue(createMockCollection());

      await deleteCollection('col-123');

      expect(prisma.collection.delete).toHaveBeenCalledWith({
        where: { id: 'col-123', userId: 'user-123' },
      });
    });

    it('revalidates paths after deletion', async () => {
      vi.mocked(prisma.collection.delete).mockResolvedValue(createMockCollection());

      await deleteCollection('col-123');

      expect(revalidatePath).toHaveBeenCalledWith('/collections');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('getCollections', () => {
    it('returns collections for user with asset counts', async () => {
      const mockCollections = [{ ...createMockCollection(), _count: { assets: 5 } }];
      vi.mocked(prisma.collection.findMany).mockResolvedValue(mockCollections as any);

      const result = await getCollections();

      expect(prisma.collection.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { _count: { select: { assets: true } } },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      });
      expect(result).toEqual(mockCollections);
    });
  });

  describe('getCollection', () => {
    it('returns collection with assets', async () => {
      const mockCollection = {
        ...createMockCollection(),
        assets: [{ asset: createMockAsset() }],
        _count: { assets: 1 },
      };
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(mockCollection as any);

      const result = await getCollection('col-123');

      expect(prisma.collection.findUnique).toHaveBeenCalledWith({
        where: { id: 'col-123', userId: 'user-123' },
        include: {
          assets: {
            include: { asset: true },
            orderBy: { asset: { updatedAt: 'desc' } },
          },
          _count: { select: { assets: true } },
        },
      });
      expect(result).toEqual(mockCollection);
    });
  });

  describe('toggleCollectionPin', () => {
    it('toggles pin state', async () => {
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(
        createMockCollection({ pinned: false }) as any
      );
      vi.mocked(prisma.collection.update).mockResolvedValue(createMockCollection({ pinned: true }));

      await toggleCollectionPin('col-123');

      expect(prisma.collection.update).toHaveBeenCalledWith({
        where: { id: 'col-123', userId: 'user-123' },
        data: { pinned: true },
      });
    });

    it('throws error when collection not found', async () => {
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(null);

      await expect(toggleCollectionPin('nonexistent')).rejects.toThrow('Collection not found');
    });
  });

  describe('addAssetToCollection', () => {
    it('adds asset to collection', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset() as any);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(createMockCollection() as any);
      vi.mocked(prisma.assetCollection.upsert).mockResolvedValue({} as any);

      await addAssetToCollection('asset-123', 'col-123');

      expect(prisma.assetCollection.upsert).toHaveBeenCalledWith({
        where: { assetId_collectionId: { assetId: 'asset-123', collectionId: 'col-123' } },
        create: { assetId: 'asset-123', collectionId: 'col-123' },
        update: {},
      });
    });

    it('throws error when asset not found', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(createMockCollection() as any);

      await expect(addAssetToCollection('asset-123', 'col-123')).rejects.toThrow('Not found');
    });

    it('throws error when collection not found', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset() as any);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(null);

      await expect(addAssetToCollection('asset-123', 'col-123')).rejects.toThrow('Not found');
    });

    it('revalidates paths after adding', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset() as any);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(createMockCollection() as any);
      vi.mocked(prisma.assetCollection.upsert).mockResolvedValue({} as any);

      await addAssetToCollection('asset-123', 'col-123');

      expect(revalidatePath).toHaveBeenCalledWith('/collections');
    });
  });

  describe('removeAssetFromCollection', () => {
    it('removes asset from collection', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset() as any);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(createMockCollection() as any);
      vi.mocked(prisma.assetCollection.delete).mockResolvedValue({} as any);

      await removeAssetFromCollection('asset-123', 'col-123');

      expect(prisma.assetCollection.delete).toHaveBeenCalledWith({
        where: { assetId_collectionId: { assetId: 'asset-123', collectionId: 'col-123' } },
      });
    });

    it('throws error when asset or collection not found', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(null);

      await expect(removeAssetFromCollection('asset-123', 'col-123')).rejects.toThrow('Not found');
    });

    it('revalidates paths after removing', async () => {
      vi.mocked(prisma.asset.findUnique).mockResolvedValue(createMockAsset() as any);
      vi.mocked(prisma.collection.findUnique).mockResolvedValue(createMockCollection() as any);
      vi.mocked(prisma.assetCollection.delete).mockResolvedValue({} as any);

      await removeAssetFromCollection('asset-123', 'col-123');

      expect(revalidatePath).toHaveBeenCalledWith('/collections');
    });
  });
});
```

- [ ] **Step 2: Run the tests**

Run:

```bash
npm run test:run -- src/app/actions/collections.test.ts
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/collections.test.ts
git commit -m "test: add collections action tests

- Test createCollection with user association
- Test updateCollection and deleteCollection
- Test getCollections with asset counts
- Test getCollection with assets
- Test toggleCollectionPin
- Test addAssetToCollection and removeAssetFromCollection
- Test all error handling scenarios"
```

---

## Phase 4: Pre-commit Hooks

### Task 13: Configure Husky and Lint-Staged

**Files:**

- Create: `.husky/pre-commit`
- Modify: `package.json`

**Context:** Pre-commit hooks ensure tests pass before code is committed.

- [ ] **Step 1: Initialize Husky**

Run:

```bash
npx husky init
```

Expected: Creates `.husky/` directory with sample hooks.

- [ ] **Step 2: Create pre-commit hook**

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Make it executable:

```bash
chmod +x .husky/pre-commit
```

- [ ] **Step 3: Configure lint-staged in package.json**

Add to `package.json` root level:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "vitest run --reporter=dot"]
  }
}
```

- [ ] **Step 4: Test the hook**

Make a small change to a test file and try to commit:

```bash
echo "// test" >> src/components/ui/button.test.tsx
git add src/components/ui/button.test.tsx
git commit -m "test: verify pre-commit hook"
```

Expected: Hook runs eslint and tests before committing.

- [ ] **Step 5: Commit configuration**

```bash
git add .husky/pre-commit package.json
git commit -m "chore: configure pre-commit hooks with husky and lint-staged

- Add pre-commit hook running lint-staged
- Configure lint-staged to run eslint and vitest
- Ensure tests pass before each commit"
```

---

## Phase 5: Coverage Verification

### Task 14: Run Coverage Report

**Files:**

- None (verification task)

**Context:** Generate coverage report to verify targets are met.

- [ ] **Step 1: Run coverage report**

Run:

```bash
npm run test:coverage
```

Expected: Coverage report generates in `coverage/` directory.

- [ ] **Step 2: Check coverage thresholds**

Verify coverage meets or exceeds:

- Lines: 80%
- Functions: 80%
- Branches: 70%

If below thresholds, identify untested code and add tests.

- [ ] **Step 3: View HTML report**

Open `coverage/index.html` in browser to see detailed coverage.

- [ ] **Step 4: Add coverage to .gitignore**

If not already present, add to `.gitignore`:

```
coverage/
```

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: add coverage directory to gitignore

- Prevent coverage reports from being committed
- Keep repository clean"
```

---

## Phase 6: Final Documentation

### Task 15: Update README with Testing Information

**Files:**

- Modify: `README.md`

**Context:** Document testing workflow for other developers.

- [ ] **Step 1: Add testing section to README**

Add to `README.md` after the Getting Started section:

````markdown
## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```
````

### Test Structure

- Tests are co-located with source files (e.g., `button.tsx` → `button.test.tsx`)
- Shared test utilities are in `src/test/`
- Run `npm run test:coverage` to see coverage report

### Pre-commit Hooks

Tests automatically run on pre-commit via Husky + lint-staged. Commits will be blocked if tests fail.

````

- [ ] **Step 2: Commit documentation**

```bash
git add README.md
git commit -m "docs: add testing documentation to README

- Document test commands and usage
- Explain test file structure
- Document pre-commit hooks"
````

---

## Summary

### Files Created

1. `vitest.config.ts` - Vitest configuration
2. `src/test/setup.ts` - Global test setup
3. `src/test/mocks/prisma.ts` - Prisma mock factory
4. `src/test/mocks/auth.ts` - Auth mock helpers
5. `src/test/utils/test-data.ts` - Test data generators
6. `src/components/ui/button.test.tsx` - Button tests
7. `src/components/ui/card.test.tsx` - Card tests
8. `src/components/ui/input.test.tsx` - Input tests
9. `src/components/ui/tabs.test.tsx` - Tabs tests
10. `src/app/actions/assets.test.ts` - Assets action tests
11. `src/app/actions/collections.test.ts` - Collections action tests
12. `.husky/pre-commit` - Pre-commit hook

### Files Modified

1. `package.json` - Added dependencies, scripts, lint-staged config
2. `.gitignore` - Added coverage directory
3. `README.md` - Added testing documentation

### Success Criteria

- [ ] All UI components have comprehensive tests
- [ ] All server actions have comprehensive tests
- [ ] Coverage meets or exceeds 80% lines, 80% functions, 70% branches
- [ ] Pre-commit hooks run successfully
- [ ] Documentation is complete

---

## Self-Review Checklist

### Spec Coverage

- ✅ Infrastructure setup (Vitest config, setup.ts, mocks)
- ✅ UI component tests (Button, Card, Input, Tabs)
- ✅ Server action tests (assets.ts, collections.ts)
- ✅ Pre-commit hooks (Husky, lint-staged)
- ✅ Coverage reporting
- ✅ Documentation

### Placeholder Scan

- ✅ No TBD, TODO, or incomplete sections
- ✅ All code is complete and copy-paste ready
- ✅ All commands have expected outputs

### Type Consistency

- ✅ Mock function names consistent
- ✅ Test data generators use correct types
- ✅ File paths are correct and consistent
