# Vitest Unit Testing Design

**Date:** 2025-04-15  
**Status:** Approved  
**Scope:** Add comprehensive unit testing to Cellar project using Vitest

---

## Overview

This document outlines the design for implementing unit tests across the Cellar codebase. The project currently has no tests and uses Next.js 16 with React 19, Prisma ORM, and a growing UI component library.

## Goals

1. Establish robust testing infrastructure with Vitest
2. Achieve comprehensive test coverage across:
   - UI components (Button, Card, Input, Tabs, etc.)
   - Server actions (assets.ts, collections.ts)
   - Utilities and helper functions
3. Enable test-driven development for new features
4. Maintain fast test execution and developer experience

## Approach

**Hybrid Testing Strategy:**

- **Phase 1 (Immediate):** Write tests for existing code to establish coverage
- **Phase 2 (Ongoing):** Use TDD for new features going forward

This approach avoids the inefficiency of rewriting working code while building the TDD habit for future development.

---

## 1. Test Infrastructure

### Core Stack

| Tool                          | Purpose           | Rationale                                         |
| ----------------------------- | ----------------- | ------------------------------------------------- |
| **Vitest**                    | Test runner       | Fast, native ESM, excellent TypeScript support    |
| **@testing-library/react**    | Component testing | Industry standard for React testing               |
| **@testing-library/jest-dom** | DOM assertions    | Readable, semantic assertions                     |
| **happy-dom**                 | DOM environment   | Faster than jsdom, sufficient for component tests |
| **@vitest/coverage-v8**       | Code coverage     | Native V8 coverage, accurate reports              |
| **vitest-mock-extended**      | Mock utilities    | Type-safe mocking for TypeScript                  |

### Package Scripts

```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:run": "vitest run"
}
```

**Script Descriptions:**

- `npm test` - Watch mode for development (re-runs on file changes)
- `npm run test:ui` - Browser-based test explorer for debugging
- `npm run test:coverage` - Full test run with coverage report
- `npm run test:run` - One-time run (for CI/pre-commit hooks)

### Configuration

**vitest.config.ts:**

- Environment: `happy-dom` for components, `node` for server actions
- Global setup: `src/test/setup.ts`
- Coverage thresholds: 80% lines/functions, 70% branches (adjustable)
- Pattern: `**/*.test.{ts,tsx}`

### Global Test Setup (src/test/setup.ts)

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
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
```

---

## 2. UI Component Testing

### Philosophy

Test **behavior**, not implementation. Focus on what users see and do, not internal state.

### Test Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'
import { describe, it, expect, vi } from 'vitest'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<Button loading>Click</Button>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### What to Test

**DO Test:**

- ✓ Rendering with different props
- ✓ User interactions (click, type, focus, blur)
- ✓ Accessibility attributes (ARIA roles, labels)
- ✓ Visual states (disabled, loading, error, active)
- ✓ Callback functions fire correctly
- ✓ Form integration (if applicable)

**DON'T Test:**

- ✗ Internal implementation details
- ✗ CSS class names (fragile, changes often)
- ✗ Exact HTML structure
- ✗ Internal state management
- ✗ PropTypes/type definitions

### Component Testing Priority

1. **Foundation Components** (Highest Priority)
   - Button, Input, Label, Card
   - These are used everywhere; if they break, everything breaks

2. **Interaction Components**
   - Tabs, Modal, Select, Drawer
   - Test state transitions and user flows

3. **Display Components**
   - Badge, Avatar, Alert, EmptyState
   - Focus on rendering and variations

4. **Layout Components**
   - Header, Sidebar, AppShell
   - Navigation and structural elements

5. **Page Components** (Lower Priority)
   - dashboard-client, assets-client
   - Integration tests using mocked data

---

## 3. Server Action Testing

### Testing Strategy

Server actions depend on Prisma and authentication. Mock external dependencies and test business logic in isolation.

### Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAsset, deleteAsset, getAssets } from './assets';

// Mock Prisma
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

// Mock authentication
vi.mock('@/lib/session', () => ({
  getUser: vi.fn(() => ({ id: 'user-123', email: 'test@example.com' })),
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock file system
vi.mock('fs/promises', () => ({
  unlink: vi.fn(),
}));

describe('createAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates asset with user association', async () => {
    const mockAsset = {
      id: 'asset-1',
      title: 'Test Asset',
      type: 'DOCUMENT',
      userId: 'user-123',
    };
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.asset.create).mockResolvedValue(mockAsset);

    const result = await createAsset({
      type: 'DOCUMENT',
      title: 'Test Asset',
    });

    expect(prisma.asset.create).toHaveBeenCalledWith({
      data: {
        type: 'DOCUMENT',
        title: 'Test Asset',
        userId: 'user-123',
      },
    });
    expect(result).toEqual(mockAsset);
  });

  it('throws error when user is not authenticated', async () => {
    const { getUser } = await import('@/lib/session');
    vi.mocked(getUser).mockRejectedValue(new Error('Unauthorized'));

    await expect(createAsset({ type: 'DOCUMENT', title: 'Test' })).rejects.toThrow('Unauthorized');
  });
});

describe('deleteAsset', () => {
  it('deletes file from disk if asset has filePath', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { unlink } = await import('fs/promises');

    vi.mocked(prisma.asset.findUnique).mockResolvedValue({
      id: 'asset-1',
      filePath: 'uploads/test.pdf',
    } as any);

    await deleteAsset('asset-1');

    expect(unlink).toHaveBeenCalled();
    expect(prisma.asset.delete).toHaveBeenCalledWith({
      where: { id: 'asset-1', userId: 'user-123' },
    });
  });

  it('throws error when asset not found', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.asset.findUnique).mockResolvedValue(null);

    await expect(deleteAsset('nonexistent')).rejects.toThrow('Asset not found');
  });

  it('prevents path traversal attacks', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { unlink } = await import('fs/promises');

    vi.mocked(prisma.asset.findUnique).mockResolvedValue({
      id: 'asset-1',
      filePath: '../../../etc/passwd',
    } as any);

    await deleteAsset('asset-1');

    // unlink should NOT be called for malicious paths
    expect(unlink).not.toHaveBeenCalled();
  });
});

describe('getAssets', () => {
  it('applies type filter', async () => {
    const { prisma } = await import('@/lib/prisma');
    const mockAssets = [{ id: '1', title: 'Doc' }];
    vi.mocked(prisma.asset.findMany).mockResolvedValue(mockAssets);

    const result = await getAssets({ type: 'DOCUMENT' });

    expect(prisma.asset.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123', type: 'DOCUMENT' },
      orderBy: { updatedAt: 'desc' },
    });
    expect(result).toEqual(mockAssets);
  });

  it('applies sort order', async () => {
    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.asset.findMany).mockResolvedValue([]);

    await getAssets({ sort: 'az' });

    expect(prisma.asset.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      orderBy: { title: 'asc' },
    });
  });
});
```

### What to Test

**DO Test:**

- ✓ Business logic and data transformations
- ✓ Prisma query construction
- ✓ Error handling (not found, unauthorized)
- ✓ Security measures (path traversal protection)
- ✓ Side effects (file deletion, cache revalidation)
- ✓ User authentication/authorization checks

**Mocking Strategy:**

- Prisma client: Mock all database calls
- `getUser()`: Mock authentication context
- `revalidatePath()`: Mock Next.js cache
- File system: Mock `fs/promises` operations

---

## 4. Test Organization

### Co-located Test Files

Tests live next to the files they test. This is the modern best practice for JavaScript/TypeScript projects.

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── button.test.tsx
│   │   ├── card.tsx
│   │   └── card.test.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   └── header.test.tsx
│   └── assets/
│       ├── asset-card.tsx
│       └── asset-card.test.tsx
├── app/
│   └── actions/
│       ├── assets.ts
│       ├── assets.test.ts
│       ├── collections.ts
│       └── collections.test.ts
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── test/
    ├── setup.ts
    └── mocks/
        ├── prisma.ts
        └── auth.ts
```

### File Naming Convention

- Source: `component.tsx` or `utils.ts`
- Test: `component.test.tsx` or `utils.test.ts`

### Shared Test Utilities (src/test/)

```
src/test/
├── setup.ts                    # Global test configuration
├── mocks/
│   ├── prisma.ts              # Prisma mock factory
│   ├── auth.ts                # Auth mock helpers
│   └── next-navigation.ts     # Next.js router mock
└── utils/
    ├── render-with-providers.tsx  # Custom render with context
    └── test-data.ts              # Fixture data generators
```

### Example Shared Utilities

**src/test/mocks/prisma.ts:**

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
    },
    collection: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    assetCollection: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $transaction: vi.fn(ops => Promise.all(ops)),
  };
}
```

**src/test/utils/test-data.ts:**

```typescript
import { AssetType } from '@/generated/prisma';

export function createMockAsset(overrides = {}) {
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockCollection(overrides = {}) {
  return {
    id: 'collection-123',
    userId: 'user-123',
    name: 'Test Collection',
    description: null,
    color: null,
    pinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

---

## 5. Pre-commit Hooks

### Husky + lint-staged Setup

**Package additions:**

```json
{
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0"
}
```

**Configuration (.husky/pre-commit):**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**lint-staged configuration (package.json):**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "vitest run --reporter=dot"]
  }
}
```

**Benefits:**

- Runs linting on staged files only (fast)
- Runs related tests before commit
- Prevents commits with failing tests or lint errors
- Uses `--reporter=dot` for minimal output

---

## 6. Coverage Goals

### Initial Targets

| Category           | Target | Rationale                         |
| ------------------ | ------ | --------------------------------- |
| **UI Components**  | 90%    | Critical for user experience      |
| **Server Actions** | 85%    | Business logic, security-critical |
| **Utilities**      | 80%    | Helper functions, lower risk      |
| **Overall**        | 85%    | Balanced coverage goal            |

### Coverage Reports

- **Local:** `npm run test:coverage` generates HTML report in `coverage/` folder
- **View:** Open `coverage/index.html` in browser
- **Exclude:** Auto-generated files (Prisma client), types, constants

---

## 7. Implementation Phases

### Phase 1: Infrastructure (Day 1)

1. Install Vitest and dependencies
2. Create vitest.config.ts
3. Create src/test/setup.ts
4. Add package scripts
5. Verify test runner works with a simple test

### Phase 2: UI Foundation (Days 2-3)

1. Test Button component (baseline pattern)
2. Test Input, Label, Card components
3. Create shared test utilities
4. Establish component testing patterns

### Phase 3: Complex UI Components (Days 4-5)

1. Test Modal, Drawer (portal testing)
2. Test Tabs, Select (state management)
3. Test Alert, Badge, Avatar (variations)

### Phase 4: Server Actions (Days 6-8)

1. Mock Prisma and auth
2. Test assets.ts CRUD operations
3. Test collections.ts operations
4. Test error handling and edge cases

### Phase 5: Utilities & Integration (Days 9-10)

1. Test helper utilities
2. Add pre-commit hooks
3. Verify coverage targets
4. Document patterns in README

---

## 8. Common Patterns

### Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react'

describe('AsyncComponent', () => {
  it('shows loading state then data', async () => {
    render(<AsyncComponent />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument()
    })
  })
})
```

### Testing Forms

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('Form', () => {
  it('submits form data', async () => {
    const handleSubmit = vi.fn()
    render(<Form onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John' }
    })
    fireEvent.click(screen.getByText('Submit'))

    expect(handleSubmit).toHaveBeenCalledWith({ name: 'John' })
  })
})
```

### Testing Error Boundaries

```typescript
describe('Component', () => {
  it('handles errors gracefully', () => {
    // Mock a failing dependency
    vi.mocked(someFunction).mockImplementation(() => {
      throw new Error('Failed')
    })

    render(<Component />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
```

---

## 9. Developer Workflow

### Daily Development

1. **Start working:** `npm test` (starts watch mode)
2. **Write test:** Create `*.test.ts` next to source file
3. **See it fail:** Vitest shows failure in terminal
4. **Implement feature:** Write minimal code to pass
5. **Refactor:** Improve code while tests pass
6. **Check coverage:** `npm run test:coverage` before commit
7. **Commit:** Pre-commit hooks run tests automatically

### Code Review Checklist

- [ ] New code has corresponding tests
- [ ] Tests are readable and descriptive
- [ ] Edge cases are covered
- [ ] Mocks are appropriate (not over-mocking)
- [ ] Coverage doesn't decrease

---

## 10. Troubleshooting Guide

### Common Issues

**Tests failing due to module resolution:**

```typescript
// Add to vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

**CSS/SCSS imports failing:**

```typescript
// In vitest.config.ts
css: {
  include: [/\.css$/],
}
```

**Environment variables not loading:**

```typescript
// In vitest.config.ts
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    env: loadEnv('', process.cwd(), ''),
  },
});
```

---

## Dependencies to Add

### Dev Dependencies

```json
{
  "vitest": "^2.0.0",
  "@vitest/ui": "^2.0.0",
  "@vitest/coverage-v8": "^2.0.0",
  "@testing-library/react": "^15.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "happy-dom": "^14.0.0",
  "vitest-mock-extended": "^1.0.0",
  "husky": "^9.0.0",
  "lint-staged": "^15.0.0"
}
```

---

## Success Criteria

- [ ] All UI components have tests
- [ ] All server actions have tests
- [ ] Coverage reaches 85% overall
- [ ] Tests run in under 30 seconds
- [ ] Pre-commit hooks prevent broken commits
- [ ] New features use TDD workflow
- [ ] Documentation is clear and up-to-date

---

## Appendix: Quick Reference

### Running Tests

```bash
npm test                    # Watch mode
npm run test:run            # Single run
npm run test:ui             # Browser UI
npm run test:coverage       # With coverage
npm test -- button.test     # Filter by file
npm test -- --grep "click"  # Filter by test name
```

### Writing a Test

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Component } from './component'

describe('Component', () => {
  it('does something', () => {
    render(<Component />)
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

---

## Decision Log

| Date       | Decision                      | Rationale                                        |
| ---------- | ----------------------------- | ------------------------------------------------ |
| 2025-04-15 | Use Vitest                    | Faster than Jest, native ESM, better DX          |
| 2025-04-15 | happy-dom over jsdom          | Faster execution, sufficient for our needs       |
| 2025-04-15 | Co-located tests              | Easier to find, maintain, and encourages testing |
| 2025-04-15 | Mock Prisma (no test DB)      | Fast, isolated, sufficient for unit tests        |
| 2025-04-15 | 85% coverage target           | Balanced between thoroughness and practicality   |
| 2025-04-15 | Pre-commit hooks only (no CI) | User preference, keeps workflow lightweight      |

---

## Next Steps

1. Review and approve this design document
2. Create implementation plan with writing-plans skill
3. Execute Phase 1: Infrastructure setup
4. Proceed through remaining phases
