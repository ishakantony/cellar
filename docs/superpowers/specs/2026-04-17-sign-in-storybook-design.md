# Sign-In Page Storybook Migration Design

**Date**: 2026-04-17
**Status**: Approved for Implementation
**Scope**: Refactor sign-in/sign-up pages to follow Storybook/Atomic Design principles

## Background

Current auth pages are monolithic: 275 lines of duplicated code mixing business logic, auth handling, and UI markup. This violates Storybook principles and makes testing difficult.

**Current State**:
- `sign-in/page.tsx`: 129 lines
- `sign-up/page.tsx`: 146 lines
- No Storybook stories for auth components
- Raw useState forms without validation

**Target State**:
- Thin page wrappers (~10 lines each)
- Full Atomic Design hierarchy
- 14+ Storybook stories covering all states
- React Hook Form + Zod for type-safe validation

## Architecture

### Atomic Design Hierarchy

```
Pages (app/)
  └── Templates (components/auth/)
        └── Organisms (components/auth/)
              └── Molecules (components/ui/ + components/auth/)
                    └── Atoms (components/ui/)
```

### Component Inventory

#### Atoms - UI (Existing)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `Button` | `components/ui/button.tsx` | ✅ Existing | `UI/Button` |
| `Input` | `components/ui/input.tsx` | ✅ Existing | `UI/Input` |
| `Label` | `components/ui/label.tsx` | ✅ Existing | `UI/Label` |
| `Alert` | `components/ui/alert.tsx` | ✅ Existing | `UI/Alert` |

#### Atoms - UI (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `Divider` | `components/ui/divider.tsx` | 🆕 New | `UI/Divider` |
| `TextLink` | `components/ui/text-link.tsx` | 🆕 New | `UI/TextLink` |

#### Atoms - Auth (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `LogoIcon` | `components/auth/logo-icon.tsx` | 🆕 New | `Auth/LogoIcon` |

#### Molecules - UI (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `FormField` | `components/ui/form-field.tsx` | 🆕 New | `UI/FormField` |

#### Molecules - Auth (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `AuthHeader` | `components/auth/auth-header.tsx` | 🆕 New | `Auth/AuthHeader` |
| `AuthFooter` | `components/auth/auth-footer.tsx` | 🆕 New | `Auth/AuthFooter` |

#### Organisms - Auth (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `SignInForm` | `components/auth/sign-in-form.tsx` | 🆕 New | `Auth/SignInForm` |
| `SignUpForm` | `components/auth/sign-up-form.tsx` | 🆕 New | `Auth/SignUpForm` |
| `SocialLoginSection` | `components/auth/social-login-section.tsx` | 🆕 New | `Auth/SocialLoginSection` |

#### Template - Auth (New)

| Component | Location | Status | Story |
|-----------|----------|--------|-------|
| `AuthTemplate` | `components/auth/auth-template.tsx` | 🆕 New | `Auth/AuthTemplate` |

#### Pages (Refactored)

| Page | Location | Status | Story |
|------|----------|--------|-------|
| `SignInPage` | `app/(auth)/sign-in/page.tsx` | 🔄 Refactor | `Pages/SignIn` |
| `SignUpPage` | `app/(auth)/sign-up/page.tsx` | 🔄 Refactor | `Pages/SignUp` |

## Dependencies

### New Dependencies to Add

```json
{
  "react-hook-form": "^7.55.0",
  "@hookform/resolvers": "^4.0.0"
}
```

### Existing Dependencies (Already Installed)

- `zod` ^4.3.6 - Schema validation
- `lucide-react` ^1.8.0 - Icons

## Form Management Strategy

### React Hook Form + Zod Integration

**Schema Definition**:

```typescript
// schemas/auth.ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
```

**Form Component Pattern**:

```typescript
interface SignInFormProps {
  onSubmit?: (data: SignInData) => Promise<void>;
  defaultValues?: Partial<SignInData>;
}

export function SignInForm({ onSubmit, defaultValues }: SignInFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: SignInData) => {
    try {
      await onSubmit?.(data);
    } catch (error) {
      setError('root', { message: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Injection Pattern for Testing

**Storybook (Mocked)**:
```typescript
export const WithServerError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Invalid credentials');
    },
  },
};
```

**Real Page (Real Auth)**:
```typescript
<SignInForm 
  onSubmit={async (data) => {
    const result = await signIn.email(data);
    if (result.error) throw new Error(result.error.message);
  }}
/>
```

## Component Specifications

### Atoms

#### Divider
```typescript
interface DividerProps {
  text?: string; // Optional text in middle
  className?: string;
}
```
- Single line if no text
- Line + text + line if text provided

#### TextLink
```typescript
interface TextLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}
```
- Primary color with hover state
- Uses Next.js Link component

#### LogoIcon
```typescript
interface LogoIconProps {
  className?: string;
}
```
- Package icon in rounded container
- Primary container background

### Molecules

#### FormField
```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode; // The input element
}
```
- Label + input with consistent spacing
- Error message display below input

#### AuthHeader
```typescript
interface AuthHeaderProps {
  subtitle: string; // "Sign in to your vault" or "Create your vault"
}
```
- LogoIcon + "Cellar" title + subtitle

#### AuthFooter
```typescript
interface AuthFooterProps {
  prompt: string;      // "Don't have an account?"
  linkText: string;    // "Sign up"
  linkHref: string;    // "/sign-up"
}
```
- Text prompt + TextLink

### Organisms

#### SignInForm
```typescript
interface SignInFormProps {
  onSubmit?: (data: SignInData) => Promise<void>;
  defaultValues?: Partial<SignInData>;
}
```
- Email field (with email validation)
- Password field
- Submit button with loading state
- Error alert (for API errors)

**Story Variants**:
- Default (empty form)
- Loading (submitting state)
- With Error (validation error on email)
- Server Error (API error displayed)
- Pre-filled (with defaultValues)

#### SignUpForm
```typescript
interface SignUpFormProps {
  onSubmit?: (data: SignUpData) => Promise<void>;
  defaultValues?: Partial<SignUpData>;
}
```
- Name field
- Email field
- Password field (min 8 chars)
- Submit button with loading state
- Error alert

**Story Variants**:
- Default
- Loading
- With Validation Error (password too short)
- Server Error

#### SocialLoginSection
```typescript
interface SocialLoginSectionProps {
  onSuccess?: () => void;
}
```
- Divider with "or" text
- GitHub button
- Loading state during OAuth

**Story Variants**:
- Default
- Loading

### Template

#### AuthTemplate
```typescript
interface AuthTemplateProps {
  headerSubtitle: string;
  form: React.ReactNode;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkHref: string;
}
```
- Centers content on page
- Consistent max-width (max-w-sm)
- Arranges: Header → Form → Social → Footer

## Error Handling Strategy

### Three Layers

1. **Zod Schema Validation (Client-side)**
   - Field-level validation (email format, required, min length)
   - Instant feedback on blur/submit
   - Displayed inline below fields

2. **Form Submission Errors (Server-side)**
   - API failures (wrong password, user not found)
   - Network errors
   - Displayed in Alert component at top of form
   - Form stays populated for retry

3. **Global Error Boundary (App-level)**
   - Unexpected runtime errors
   - Handled by existing error boundary

### Error Display Pattern

```typescript
// In SignInForm
{errors.root && (
  <Alert variant="error">{errors.root.message}</Alert>
)}

<FormField label="Email" error={errors.email?.message}>
  <Input {...register('email')} />
</FormField>
```

## Testing Strategy

### Test Boundaries

| Layer | Vitest Tests | Storybook Tests |
|-------|--------------|-----------------|
| Zod Schema Logic | ✅ Yes | ❌ No |
| API Client Logic | ✅ Yes | ❌ No |
| Component Rendering | ❌ No | ✅ Yes |
| User Interactions | ❌ No | ✅ Yes |
| Visual States | ❌ No | ✅ Yes |
| Error Display | ❌ No | ✅ Yes |

### Vitest Test Examples

```typescript
// schemas/auth.test.ts
describe('signInSchema', () => {
  test('rejects invalid email format', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  test('requires password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
```

### Storybook Test Examples

```typescript
// SignInForm.stories.tsx
export const WithValidationError: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText('Email');
    
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(canvas.getByText('Sign In'));
    
    expect(canvas.getByText('Please enter a valid email')).toBeInTheDocument();
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Invalid credentials');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'wrongpass');
    await userEvent.click(canvas.getByText('Sign In'));
    
    expect(canvas.getByText('Invalid credentials')).toBeInTheDocument();
  },
};
```

## File Structure

```
src/
├── components/
│   ├── ui/                      # Generic UI components
│   │   ├── button.tsx           # ✅ Existing
│   │   ├── button.stories.tsx   # ✅ Existing
│   │   ├── input.tsx            # ✅ Existing
│   │   ├── input.stories.tsx    # ✅ Existing
│   │   ├── label.tsx            # ✅ Existing
│   │   ├── label.stories.tsx    # ✅ Existing
│   │   ├── alert.tsx            # ✅ Existing
│   │   ├── alert.stories.tsx    # ✅ Existing
│   │   ├── divider.tsx          # 🆕 NEW + stories
│   │   ├── text-link.tsx        # 🆕 NEW + stories
│   │   └── form-field.tsx       # 🆕 NEW + stories
│   │
│   └── auth/                    # Auth-specific components
│       ├── logo-icon.tsx        # 🆕 NEW + stories
│       ├── auth-header.tsx      # 🆕 NEW + stories
│       ├── auth-footer.tsx      # 🆕 NEW + stories
│       ├── sign-in-form.tsx     # 🆕 NEW + stories
│       ├── sign-up-form.tsx     # 🆕 NEW + stories
│       ├── social-login-section.tsx  # 🆕 NEW + stories
│       └── auth-template.tsx    # 🆕 NEW + stories
│
├── schemas/
│   └── auth.ts                  # 🆕 NEW - Zod schemas + tests
│
└── app/(auth)/
    ├── layout.tsx               # ✅ Existing (minor cleanup)
    ├── sign-in/
    │   └── page.tsx              # 🔄 REFACTORED (10 lines)
    └── sign-up/
        └── page.tsx              # 🔄 REFACTORED (10 lines)
```

## Page Implementation

### SignInPage (After Refactor)

```typescript
"use client";

import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AuthTemplate } from "@/components/auth/auth-template";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { SignInData } from "@/schemas/auth";

export default function SignInPage() {
  const router = useRouter();

  const handleSubmit = async (data: SignInData) => {
    const result = await signIn.email(data);
    if (result.error) {
      throw new Error(result.error.message ?? "Sign in failed");
    }
    router.push("/dashboard");
  };

  return (
    <AuthTemplate
      headerSubtitle="Sign in to your vault"
      form={<SignInForm onSubmit={handleSubmit} />}
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/sign-up"
    />
  );
}
```

### SignUpPage (After Refactor)

```typescript
"use client";

import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AuthTemplate } from "@/components/auth/auth-template";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { SignUpData } from "@/schemas/auth";

export default function SignUpPage() {
  const router = useRouter();

  const handleSubmit = async (data: SignUpData) => {
    const result = await signUp.email(data);
    if (result.error) {
      throw new Error(result.error.message ?? "Sign up failed");
    }
    router.push("/dashboard");
  };

  return (
    <AuthTemplate
      headerSubtitle="Create your vault"
      form={<SignUpForm onSubmit={handleSubmit} />}
      footerPrompt="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    />
  );
}
```

## Migration Checklist

### Phase 1: New UI Components
- [ ] Create `Divider` component + stories
- [ ] Create `TextLink` component + stories
- [ ] Create `FormField` molecule + stories

### Phase 2: Auth Components
- [ ] Create `LogoIcon` component + stories
- [ ] Create `AuthHeader` molecule + stories
- [ ] Create `AuthFooter` molecule + stories

### Phase 3: Forms
- [ ] Create Zod schemas in `schemas/auth.ts`
- [ ] Write Vitest tests for schemas
- [ ] Create `SignInForm` organism + stories
- [ ] Create `SignUpForm` organism + stories
- [ ] Create `SocialLoginSection` organism + stories

### Phase 4: Template & Pages
- [ ] Create `AuthTemplate` + stories
- [ ] Refactor `sign-in/page.tsx`
- [ ] Refactor `sign-up/page.tsx`

### Phase 5: Cleanup
- [ ] Delete old inline form code
- [ ] Verify all stories render correctly
- [ ] Run full test suite (Vitest + Storybook + E2E)

## Success Criteria

- [ ] Sign-in and sign-up pages work identically to before
- [ ] All 14+ new components have Storybook stories
- [ ] Form validation works with instant feedback
- [ ] Error messages display correctly for all error types
- [ ] Zod schemas have comprehensive Vitest coverage
- [ ] Pages reduced from ~130 lines to ~15 lines each
- [ ] No visual regressions from original design

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking form functionality | High | Comprehensive E2E tests before/after |
| Visual regression | Medium | Storybook visual testing, manual QA |
| Dependency conflicts | Low | Test with exact versions first |
| Schema validation UX changes | Medium | Match existing error message style |

## Next Steps

1. Write implementation plan using `writing-plans` skill
2. Create feature branch for development
3. Implement in order: UI components → Auth molecules → Forms → Template → Pages
4. Review and merge
