# Cellar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-user developer vault for storing snippets, notes, prompts, images, files, and links with isolated workspaces per user.

**Architecture:** Next.js 16 App Router with route groups `(auth)` and `(app)`. Single `Asset` table with type discriminator. Better Auth for authentication. Prisma 7 ORM with PostgreSQL 17 (Docker). Server Actions for all mutations. Asset drawer (slide-out panel) for viewing/editing. Local filesystem for file uploads.

**Tech Stack:** Next.js 16.2.3, React 19.2, TypeScript, Tailwind CSS 4, PostgreSQL 17, Prisma 7, Better Auth, Monaco Editor, react-markdown, Lucide React

---

## Important: Next.js 16 Breaking Changes

These apply throughout the plan — do NOT use the old patterns:

1. **`params` and `searchParams` are Promises** — always `await` them:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params
   }
   ```
2. **`cookies()` and `headers()` must be awaited** — `const cookieStore = await cookies()`
3. **Middleware is renamed to `proxy`** — use `proxy.ts` at project root, export `function proxy()`
4. **Turbopack is the default bundler** — no webpack config needed

## File Structure

```
cellar/
├── docker-compose.yml
├── .env.example
├── proxy.ts                          # Auth protection (Next.js 16 proxy, replaces middleware)
├── prisma/
│   └── schema.prisma                 # Prisma 7 schema
├── uploads/                          # File upload directory (gitignored)
├── src/
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── auth.ts                   # Better Auth server config
│   │   └── auth-client.ts            # Better Auth client
│   ├── app/
│   │   ├── layout.tsx                # Root layout (fonts, globals)
│   │   ├── globals.css               # Tailwind 4 theme tokens
│   │   ├── (auth)/
│   │   │   ├── layout.tsx            # Centered auth layout
│   │   │   ├── sign-in/page.tsx      # Sign in page
│   │   │   └── sign-up/page.tsx      # Sign up page
│   │   ├── (app)/
│   │   │   ├── layout.tsx            # App shell (sidebar + header)
│   │   │   ├── dashboard/page.tsx    # Dashboard
│   │   │   ├── assets/page.tsx       # All items with type filter
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx          # All collections grid
│   │   │   │   └── [id]/page.tsx     # Collection detail
│   │   │   └── settings/page.tsx     # Profile & account settings
│   │   ├── actions/
│   │   │   ├── assets.ts             # Asset CRUD server actions
│   │   │   └── collections.ts        # Collection CRUD server actions
│   │   └── api/
│   │       ├── auth/[...all]/route.ts  # Better Auth handler
│   │       ├── upload/route.ts         # File upload
│   │       └── files/[...path]/route.ts # Auth-checked file serving
│   └── components/
│       ├── sidebar.tsx               # Nav + collections list
│       ├── header.tsx                # Search + action buttons
│       ├── asset-drawer.tsx          # Slide-out view/edit/create panel
│       ├── monaco-editor.tsx         # Lazy-loaded Monaco wrapper
│       ├── markdown-preview.tsx      # Rendered markdown viewer
│       ├── asset-card.tsx            # Asset list row
│       ├── collection-card.tsx       # Collection grid card
│       ├── quick-actions.tsx         # 6 create-type buttons
│       ├── delete-dialog.tsx         # Delete confirmation modal
│       ├── collection-modal.tsx      # Create/edit collection modal
│       └── file-dropzone.tsx         # File upload input for images/files
```

---

## Task 1: Infrastructure — Docker, Dependencies, Environment

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Create docker-compose.yml**

```yaml
services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: cellar
      POSTGRES_PASSWORD: cellar
      POSTGRES_DB: cellar
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 2: Create .env.example**

```
DATABASE_URL=postgresql://cellar:cellar@localhost:5432/cellar
BETTER_AUTH_SECRET=change-me-to-a-random-string
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

- [ ] **Step 3: Copy .env.example to .env with dev defaults**

```bash
cp .env.example .env
# Edit .env and set BETTER_AUTH_SECRET to a random value:
# openssl rand -base64 32
```

- [ ] **Step 4: Update .gitignore**

Add these lines to the existing `.gitignore`:

```
# uploads
/uploads

# superpowers
.superpowers/
```

- [ ] **Step 5: Install dependencies**

```bash
npm install better-auth @prisma/client lucide-react @monaco-editor/react react-markdown remark-gfm
npm install -D prisma
```

- [ ] **Step 6: Start Postgres**

```bash
docker compose up -d
```

Expected: Postgres container running on port 5432.

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example .gitignore package.json package-lock.json
git commit -m "feat: add infrastructure — docker-compose, dependencies, env"
```

---

## Task 2: Prisma Schema and Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `prisma/migrations/.../migration.sql` (via prisma migrate)

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

This creates `prisma/schema.prisma`. The `--output` flag tells Prisma 7 where to generate the client.

- [ ] **Step 2: Write the Prisma schema**

Replace the contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AssetType {
  SNIPPET
  PROMPT
  NOTE
  LINK
  IMAGE
  FILE
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions    Session[]
  accounts    Account[]
  assets      Asset[]
  collections Collection[]
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}

model Asset {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  type        AssetType
  title       String
  description String?
  pinned      Boolean   @default(false)

  // Type-specific fields
  content     String?   // SNIPPET, PROMPT, NOTE
  language    String?   // SNIPPET
  url         String?   // LINK
  filePath    String?   // IMAGE, FILE
  fileName    String?   // IMAGE, FILE
  mimeType    String?   // IMAGE, FILE
  fileSize    Int?      // IMAGE, FILE

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  collections AssetCollection[]

  @@index([userId, type])
  @@index([userId, pinned])
  @@index([userId, updatedAt(sort: Desc)])
}

model Collection {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name        String
  description String?
  color       String?
  pinned      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assets AssetCollection[]

  @@index([userId, pinned])
}

model AssetCollection {
  assetId      String
  collectionId String
  asset        Asset      @relation(fields: [assetId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([assetId, collectionId])
}
```

- [ ] **Step 3: Run the initial migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration created and applied. Prisma client generated in `src/generated/prisma`.

- [ ] **Step 4: Add full-text search migration**

Create a custom SQL migration:

```bash
npx prisma migrate dev --name add_search_vector --create-only
```

Then edit the generated SQL file (`prisma/migrations/*_add_search_vector/migration.sql`) to contain:

```sql
-- Add tsvector column
ALTER TABLE "Asset" ADD COLUMN "searchVector" tsvector;

-- Create GIN index
CREATE INDEX "Asset_searchVector_idx" ON "Asset" USING GIN ("searchVector");

-- Create trigger function
CREATE OR REPLACE FUNCTION asset_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."content", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW."description", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER asset_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Asset"
  FOR EACH ROW
  EXECUTE FUNCTION asset_search_vector_update();
```

Then apply:

```bash
npx prisma migrate dev
```

- [ ] **Step 5: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Verify the setup**

```bash
npx prisma studio
```

Expected: Prisma Studio opens at localhost:5555 showing all tables (User, Session, Account, Verification, Asset, Collection, AssetCollection).

- [ ] **Step 7: Commit**

```bash
git add prisma/ src/lib/prisma.ts src/generated/prisma
git commit -m "feat: add Prisma schema with Asset, Collection, and full-text search"
```

---

## Task 3: Better Auth Setup

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/app/api/auth/[...all]/route.ts`
- Create: `proxy.ts`

- [ ] **Step 1: Create Better Auth server configuration**

Create `src/lib/auth.ts`:

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});
```

- [ ] **Step 2: Create Better Auth client**

Create `src/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
```

- [ ] **Step 3: Create the API route handler**

Create `src/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Create the auth proxy (Next.js 16 — replaces middleware)**

Create `proxy.ts` at the project root:

```ts
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip auth check
  const publicPaths = ["/sign-in", "/sign-up", "/api/auth"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie
  const sessionToken = request.cookies.get("better-auth.session_token");
  if (!sessionToken && pathname !== "/") {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect root to dashboard
  if (pathname === "/") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 5: Add NEXT_PUBLIC_BETTER_AUTH_URL to .env.example and .env**

Append to both `.env.example` and `.env`:

```
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 6: Verify by starting the dev server**

```bash
npm run dev
```

Expected: Server starts. Navigating to `http://localhost:3000` redirects to `/sign-in` (which will 404 for now — that's fine, we'll build it next).

- [ ] **Step 7: Commit**

```bash
git add src/lib/auth.ts src/lib/auth-client.ts src/app/api/auth/ proxy.ts .env.example
git commit -m "feat: add Better Auth with GitHub and email/password providers"
```

---

## Task 4: Tailwind Theme and Global Styles

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace globals.css with the Cellar dark theme**

Replace the entire contents of `src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: "Inter", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-background: #0a0e14;
  --color-foreground: #d9e6fd;
  --color-surface: #0a0e14;
  --color-surface-dim: #0a0e14;
  --color-surface-bright: #1e2d41;
  --color-surface-container-lowest: #000000;
  --color-surface-container-low: #0e141c;
  --color-surface-container: #121a25;
  --color-surface-container-high: #16202e;
  --color-surface-container-highest: #1a2637;
  --color-surface-variant: #1a2637;

  --color-primary: #b9c3ff;
  --color-primary-dim: #a7b5ff;
  --color-primary-container: #0033c2;
  --color-on-primary: #002eb1;
  --color-on-primary-container: #c6ceff;
  --color-on-primary-fixed: #002daf;
  --color-on-primary-fixed-variant: #2149e1;
  --color-primary-fixed: #dee1ff;
  --color-primary-fixed-dim: #cbd2ff;
  --color-inverse-primary: #264de5;

  --color-secondary: #9f9da1;
  --color-secondary-dim: #9f9da1;
  --color-secondary-container: #3b3b3f;
  --color-on-secondary: #202023;
  --color-on-secondary-container: #c1bec3;
  --color-secondary-fixed: #e4e1e6;
  --color-secondary-fixed-dim: #d6d3d8;

  --color-tertiary: #f1e7ff;
  --color-tertiary-dim: #d6c9ea;
  --color-tertiary-container: #e4d7f9;
  --color-on-tertiary: #5c526e;
  --color-on-tertiary-container: #534a65;
  --color-tertiary-fixed: #e4d7f9;
  --color-tertiary-fixed-dim: #d6c9ea;

  --color-error: #ec7c8a;
  --color-error-dim: #b95463;
  --color-error-container: #7f2737;
  --color-on-error: #490013;
  --color-on-error-container: #ff97a3;

  --color-on-background: #d9e6fd;
  --color-on-surface: #d9e6fd;
  --color-on-surface-variant: #9facc1;
  --color-outline: #6a768a;
  --color-outline-variant: #3c495b;
  --color-inverse-surface: #f8f9ff;
  --color-inverse-on-surface: #51555c;
  --color-surface-tint: #b9c3ff;

  --radius-DEFAULT: 0.125rem;
  --radius-lg: 0.25rem;
  --radius-xl: 0.5rem;
  --radius-full: 0.75rem;
}

body {
  font-family: var(--font-sans);
  background: var(--color-background);
  color: var(--color-on-background);
}

::selection {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-outline-variant);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-outline);
}

/* Glass effect utility */
.custom-glass {
  background: rgba(22, 32, 46, 0.4);
  backdrop-filter: blur(12px);
}

/* Ghost border utility */
.ghost-border {
  border: 1px solid rgba(60, 73, 91, 0.2);
}

/* Primary gradient */
.btn-gradient {
  background: linear-gradient(135deg, #b9c3ff 0%, #0033c2 100%);
}
```

- [ ] **Step 2: Update the root layout**

Replace the entire contents of `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cellar",
  description: "Your developer vault for snippets, notes, prompts, and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans h-full overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the theme loads**

```bash
npm run dev
```

Expected: Server starts. Page renders with the dark background (`#0a0e14`). No styling errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add Cellar dark theme with MD3 color tokens"
```

---

## Task 5: Auth Pages — Sign In and Sign Up

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-in/page.tsx`
- Create: `src/app/(auth)/sign-up/page.tsx`

- [ ] **Step 1: Create the auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create the sign-in page**

Create `src/app/(auth)/sign-in/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Github, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGitHub() {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Package className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-100">
          Cellar
        </h1>
        <p className="text-xs text-outline">Sign in to your vault</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs text-error">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container/30 border border-primary/30 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary-container/50 hover:border-primary/50 transition-all disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
          or
        </span>
        <div className="h-px flex-1 bg-outline-variant/30" />
      </div>

      <button
        onClick={handleGitHub}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container ghost-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-bright hover:text-slate-100 transition-all"
      >
        <Github className="h-4 w-4" />
        Continue with GitHub
      </button>

      <p className="mt-6 text-center text-xs text-outline">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 3: Create the sign-up page**

Create `src/app/(auth)/sign-up/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Github, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp.email({ name, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign up failed");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGitHub() {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Package className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-100">
          Cellar
        </h1>
        <p className="text-xs text-outline">Create your vault</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs text-error">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container/30 border border-primary/30 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary-container/50 hover:border-primary/50 transition-all disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
          or
        </span>
        <div className="h-px flex-1 bg-outline-variant/30" />
      </div>

      <button
        onClick={handleGitHub}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container ghost-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-bright hover:text-slate-100 transition-all"
      >
        <Github className="h-4 w-4" />
        Continue with GitHub
      </button>

      <p className="mt-6 text-center text-xs text-outline">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
```

- [ ] **Step 4: Delete the default page.tsx**

Remove `src/app/page.tsx` — the root `/` route is handled by the proxy redirect to `/dashboard`.

- [ ] **Step 5: Test the auth flow**

```bash
npm run dev
```

1. Navigate to `http://localhost:3000` — should redirect to `/sign-in`
2. The sign-in form should render with the dark theme
3. Navigate to `/sign-up` — the sign-up form should render
4. Create a test account with email/password
5. After sign-up, should redirect to `/dashboard` (will 404 — that's expected)

- [ ] **Step 6: Commit**

```bash
git add src/app/(auth)/ -A
git rm src/app/page.tsx
git commit -m "feat: add sign-in and sign-up pages with Better Auth"
```

---

## Task 6: App Shell — Sidebar and Header

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/sidebar.tsx`
- Create: `src/components/header.tsx`

- [ ] **Step 1: Create the sidebar component**

Create `src/components/sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const generalNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/assets", icon: Package, label: "All Items" },
  { href: "/collections", icon: Folder, label: "All Collections" },
];

const assetNav = [
  { href: "/assets?type=SNIPPET", icon: Code, label: "Snippets", type: "SNIPPET" },
  { href: "/assets?type=PROMPT", icon: Terminal, label: "Prompts", type: "PROMPT" },
  { href: "/assets?type=LINK", icon: LinkIcon, label: "Links", type: "LINK" },
  { href: "/assets?type=NOTE", icon: StickyNote, label: "Notes", type: "NOTE" },
  { href: "/assets?type=IMAGE", icon: Image, label: "Images", type: "IMAGE" },
  { href: "/assets?type=FILE", icon: FileText, label: "Files", type: "FILE" },
];

export function Sidebar({
  collapsed,
  onToggle,
  user,
}: {
  collapsed: boolean;
  onToggle: () => void;
  user: { name: string; email: string; image?: string | null };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentType = searchParams.get("type");

  function isActive(href: string, type?: string) {
    if (type) {
      return pathname === "/assets" && currentType === type;
    }
    if (href === "/assets") {
      return pathname === "/assets" && !currentType;
    }
    return pathname === href;
  }

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
  }

  return (
    <aside
      className={`${
        collapsed ? "hidden" : "flex"
      } flex-col h-full py-6 bg-surface-container-low contrast-125 w-64 border-r border-white/5 shrink-0 md:flex`}
    >
      {/* Logo */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
            <Package className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-slate-100">
            Cellar
          </h1>
          <button
            onClick={onToggle}
            className="ml-auto hidden md:flex p-1 text-slate-400 hover:bg-surface-bright hover:text-slate-100 rounded transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* General nav */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        <div className="px-4 py-2">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            General
          </p>
          {generalNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-tight transition-all duration-150 ${
                  active
                    ? "text-primary bg-primary/10 border-r-2 border-primary"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Assets nav */}
        <div className="px-4 py-2 mt-4">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
            Assets
          </p>
          {assetNav.map((item) => {
            const active = isActive(item.href, item.type);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase transition-all ${
                  active
                    ? "text-primary bg-primary/10 border-r-2 border-primary"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-4 mt-auto">
        <div className="border-t border-white/5 pt-3 mb-2 px-4">
          <Link
            href="/settings"
            className={`flex items-center gap-3 py-2 text-xs font-bold uppercase transition-all ${
              pathname === "/settings"
                ? "text-primary"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>Settings</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-container rounded-lg">
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
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-100">
              {user.name}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-error transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function SidebarCollapsedToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="hidden md:flex p-2 text-slate-400 hover:bg-surface-bright hover:text-slate-100 rounded transition-colors"
    >
      <PanelLeftOpen className="h-5 w-5" />
    </button>
  );
}
```

- [ ] **Step 2: Create the header component**

Create `src/components/header.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Search, FolderPlus, SquarePlus, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header({
  onMobileMenuToggle,
  sidebarCollapsed,
  sidebarToggle,
  onAddItem,
  onAddCollection,
}: {
  onMobileMenuToggle: () => void;
  sidebarCollapsed: boolean;
  sidebarToggle: React.ReactNode;
  onAddItem: () => void;
  onAddCollection: () => void;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/assets?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <header className="flex items-center h-14 px-6 w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-slate-400 hover:bg-surface-bright rounded md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {sidebarCollapsed && sidebarToggle}
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-surface-container-low border-none rounded-lg py-2 px-10 text-sm w-80 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-outline/50 text-on-surface"
          placeholder="Quick search..."
          type="text"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none" />
      </form>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <button
          onClick={onAddCollection}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-bright ghost-border rounded text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 transition-all"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Collection</span>
        </button>
        <button
          onClick={onAddItem}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/20 hover:bg-primary-container/40 border border-primary/20 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
        >
          <SquarePlus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create the app layout**

Create `src/app/(app)/layout.tsx`:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppShell } from "./app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    >
      {children}
    </AppShell>
  );
}
```

- [ ] **Step 4: Create the app shell client component**

Create `src/app/(app)/app-shell.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Sidebar, SidebarCollapsedToggle } from "@/components/sidebar";
import { Header } from "@/components/header";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | null>(null);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  function handleAddItem() {
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  function handleAddCollection() {
    setCollectionModalOpen(true);
  }

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={
            <SidebarCollapsedToggle
              onToggle={() => setSidebarCollapsed(false)}
            />
          }
          onAddItem={handleAddItem}
          onAddCollection={handleAddCollection}
        />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Create a placeholder dashboard page**

Create `src/app/(app)/dashboard/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-100">
        Dashboard
      </h2>
      <p className="text-xs text-outline mt-1">Welcome to your vault.</p>
    </div>
  );
}
```

- [ ] **Step 6: Test the app shell**

```bash
npm run dev
```

1. Sign in with your test account
2. Should see the sidebar, header, and placeholder dashboard
3. Sidebar navigation links should highlight correctly
4. Sidebar collapse toggle should work
5. Sign out should redirect to `/sign-in`

- [ ] **Step 7: Commit**

```bash
git add src/app/(app)/ src/components/sidebar.tsx src/components/header.tsx
git commit -m "feat: add app shell with sidebar, header, and layout"
```

---

## Task 7: Server Actions — Assets

**Files:**
- Create: `src/app/actions/assets.ts`

- [ ] **Step 1: Create the asset server actions**

Create `src/app/actions/assets.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AssetType, Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function createAsset(data: {
  type: AssetType;
  title: string;
  description?: string;
  content?: string;
  language?: string;
  url?: string;
  filePath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}) {
  const user = await getUser();
  const asset = await prisma.asset.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return asset;
}

export async function updateAsset(
  id: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
    language?: string;
    url?: string;
  }
) {
  const user = await getUser();
  const asset = await prisma.asset.update({
    where: { id, userId: user.id },
    data,
  });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
  return asset;
}

export async function deleteAsset(id: string) {
  const user = await getUser();
  const asset = await prisma.asset.findUnique({
    where: { id, userId: user.id },
  });
  if (!asset) throw new Error("Asset not found");

  // Remove file from disk if it's an image or file type
  if (asset.filePath) {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const fullPath = join(process.cwd(), uploadDir, asset.filePath);
    await unlink(fullPath).catch(() => {});
  }

  await prisma.asset.delete({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function getAssets(filters?: {
  type?: AssetType;
  sort?: "newest" | "oldest" | "az" | "za";
  q?: string;
}) {
  const user = await getUser();

  // Full-text search
  if (filters?.q) {
    const assets = await prisma.$queryRaw<
      Array<{
        id: string;
        userId: string;
        type: AssetType;
        title: string;
        description: string | null;
        pinned: boolean;
        content: string | null;
        language: string | null;
        url: string | null;
        filePath: string | null;
        fileName: string | null;
        mimeType: string | null;
        fileSize: number | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >`
      SELECT * FROM "Asset"
      WHERE "userId" = ${user.id}
      AND "searchVector" @@ plainto_tsquery('english', ${filters.q})
      ${filters.type ? Prisma.sql`AND "type" = ${filters.type}::"AssetType"` : Prisma.empty}
      ORDER BY ts_rank("searchVector", plainto_tsquery('english', ${filters.q})) DESC
    `;
    return assets;
  }

  const orderBy: Prisma.AssetOrderByWithRelationInput =
    filters?.sort === "oldest"
      ? { createdAt: "asc" }
      : filters?.sort === "az"
        ? { title: "asc" }
        : filters?.sort === "za"
          ? { title: "desc" }
          : { updatedAt: "desc" };

  return prisma.asset.findMany({
    where: {
      userId: user.id,
      ...(filters?.type && { type: filters.type }),
    },
    orderBy,
  });
}

export async function getAsset(id: string) {
  const user = await getUser();
  return prisma.asset.findUnique({
    where: { id, userId: user.id },
    include: {
      collections: {
        include: { collection: true },
      },
    },
  });
}

export async function togglePin(id: string) {
  const user = await getUser();
  const asset = await prisma.asset.findUnique({
    where: { id, userId: user.id },
  });
  if (!asset) throw new Error("Asset not found");
  await prisma.asset.update({
    where: { id, userId: user.id },
    data: { pinned: !asset.pinned },
  });
  revalidatePath("/dashboard");
  revalidatePath("/assets");
}

export async function getDashboardData() {
  const user = await getUser();

  const [pinnedAssets, pinnedCollections, recentAssets] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: user.id, pinned: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.collection.findMany({
      where: { userId: user.id, pinned: true },
      include: { _count: { select: { assets: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.asset.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return { pinnedAssets, pinnedCollections, recentAssets };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/actions/assets.ts
git commit -m "feat: add asset server actions (CRUD, search, pin, dashboard)"
```

---

## Task 8: Server Actions — Collections

**Files:**
- Create: `src/app/actions/collections.ts`

- [ ] **Step 1: Create the collection server actions**

Create `src/app/actions/collections.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function createCollection(data: {
  name: string;
  description?: string;
  color?: string;
}) {
  const user = await getUser();
  const collection = await prisma.collection.create({
    data: {
      ...data,
      userId: user.id,
    },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  return collection;
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
  }
) {
  const user = await getUser();
  const collection = await prisma.collection.update({
    where: { id, userId: user.id },
    data,
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
  return collection;
}

export async function deleteCollection(id: string) {
  const user = await getUser();
  await prisma.collection.delete({
    where: { id, userId: user.id },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
}

export async function getCollections() {
  const user = await getUser();
  return prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { assets: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCollection(id: string) {
  const user = await getUser();
  return prisma.collection.findUnique({
    where: { id, userId: user.id },
    include: {
      assets: {
        include: { asset: true },
        orderBy: { asset: { updatedAt: "desc" } },
      },
      _count: { select: { assets: true } },
    },
  });
}

export async function toggleCollectionPin(id: string) {
  const user = await getUser();
  const collection = await prisma.collection.findUnique({
    where: { id, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");
  await prisma.collection.update({
    where: { id, userId: user.id },
    data: { pinned: !collection.pinned },
  });
  revalidatePath("/collections");
  revalidatePath("/dashboard");
}

export async function addAssetToCollection(
  assetId: string,
  collectionId: string
) {
  const user = await getUser();

  // Verify both belong to user
  const [asset, collection] = await Promise.all([
    prisma.asset.findUnique({ where: { id: assetId, userId: user.id } }),
    prisma.collection.findUnique({
      where: { id: collectionId, userId: user.id },
    }),
  ]);
  if (!asset || !collection) throw new Error("Not found");

  await prisma.assetCollection.create({
    data: { assetId, collectionId },
  });
  revalidatePath("/collections");
}

export async function removeAssetFromCollection(
  assetId: string,
  collectionId: string
) {
  const user = await getUser();

  // Verify collection belongs to user
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, userId: user.id },
  });
  if (!collection) throw new Error("Collection not found");

  await prisma.assetCollection.delete({
    where: {
      assetId_collectionId: { assetId, collectionId },
    },
  });
  revalidatePath("/collections");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/actions/collections.ts
git commit -m "feat: add collection server actions (CRUD, pin, asset management)"
```

---

## Task 9: File Upload API Route

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/app/api/files/[...path]/route.ts`

- [ ] **Step 1: Create the upload route**

Create `src/app/api/upload/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { extname } from "path";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const maxFileSize = parseInt(
    process.env.MAX_FILE_SIZE || "10485760",
    10
  );
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json(
      { error: `File too large. Max size: ${maxFileSize / 1024 / 1024}MB` },
      { status: 413 }
    );
  }

  const userDir = join(process.cwd(), uploadDir, session.user.id);
  await mkdir(userDir, { recursive: true });

  const ext = extname(file.name);
  const storedName = `${randomUUID()}${ext}`;
  const storedPath = join(userDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storedPath, buffer);

  // Return the relative path (userId/filename) — stored in Asset.filePath
  const relativePath = `${session.user.id}/${storedName}`;

  return NextResponse.json({
    filePath: relativePath,
    fileName: file.name,
    mimeType: file.type,
    fileSize: file.size,
  });
}
```

- [ ] **Step 2: Create the file serving route**

Create `src/app/api/files/[...path]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const filePath = path.join("/");

  // Security: verify the file belongs to the requesting user
  if (!filePath.startsWith(session.user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const fullPath = join(process.cwd(), uploadDir, filePath);

  try {
    const fileStat = await stat(fullPath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readFile(fullPath);

    // Determine content type from extension
    const ext = fullPath.split(".").pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      pdf: "application/pdf",
      json: "application/json",
      txt: "text/plain",
    };
    const contentType = contentTypes[ext ?? ""] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/upload/ src/app/api/files/
git commit -m "feat: add file upload and auth-checked file serving routes"
```

---

## Task 10: Shared UI Components — Asset Card, Collection Card, Quick Actions, Delete Dialog

**Files:**
- Create: `src/components/asset-card.tsx`
- Create: `src/components/collection-card.tsx`
- Create: `src/components/quick-actions.tsx`
- Create: `src/components/delete-dialog.tsx`
- Create: `src/components/collection-modal.tsx`

- [ ] **Step 1: Create the asset card component**

Create `src/components/asset-card.tsx`:

```tsx
"use client";

import {
  FileCode,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
  Braces,
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";
import { useState, useRef, useEffect } from "react";

const TYPE_CONFIG: Record<
  AssetType,
  { icon: typeof FileCode; iconWrap: string; label: string }
> = {
  SNIPPET: {
    icon: Braces,
    iconWrap: "bg-primary/10 text-primary",
    label: "Snippet",
  },
  PROMPT: {
    icon: Terminal,
    iconWrap: "bg-tertiary-container/20 text-tertiary",
    label: "Prompt",
  },
  NOTE: {
    icon: StickyNote,
    iconWrap: "bg-amber-500/10 text-amber-400",
    label: "Note",
  },
  LINK: {
    icon: LinkIcon,
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    label: "Link",
  },
  IMAGE: {
    icon: Image,
    iconWrap: "bg-rose-500/10 text-rose-400",
    label: "Image",
  },
  FILE: {
    icon: FileText,
    iconWrap: "bg-violet-500/10 text-violet-400",
    label: "File",
  },
};

export function AssetCard({
  asset,
  onClick,
  onTogglePin,
  onDelete,
  compact = false,
}: {
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
}) {
  const config = TYPE_CONFIG[asset.type];
  const Icon = config.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const subtitle =
    asset.type === "SNIPPET" && asset.language
      ? `${config.label} • ${asset.language}`
      : config.label;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container ghost-border rounded-lg group transition-all cursor-pointer"
      >
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded ${config.iconWrap}`}
        >
          <Icon className="h-[14px] w-[14px]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">
            {asset.title}
          </p>
          <p className="text-[10px] text-outline truncate">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-3 bg-surface-container-low hover:bg-surface-container-high ghost-border rounded-lg group transition-all cursor-pointer"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${config.iconWrap}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-200 truncate">
          {asset.title}
        </h4>
        <p className="text-[10px] text-outline font-mono truncate">
          {subtitle}
        </p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 hover:bg-surface-bright rounded text-outline hover:text-on-surface opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl border border-white/10 py-1 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-bright transition-colors"
            >
              {asset.pinned ? (
                <PinOff className="h-3.5 w-3.5" />
              ) : (
                <Pin className="h-3.5 w-3.5" />
              )}
              {asset.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the collection card component**

Create `src/components/collection-card.tsx`:

```tsx
"use client";

import { Folder, MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const COLLECTION_COLORS: Record<string, string> = {
  "#3b82f6": "bg-blue-500/15 text-blue-400",
  "#a855f7": "bg-purple-500/15 text-purple-400",
  "#10b981": "bg-emerald-500/15 text-emerald-400",
  "#f59e0b": "bg-amber-500/15 text-amber-400",
  "#ef4444": "bg-red-500/15 text-red-400",
  "#ec4899": "bg-pink-500/15 text-pink-400",
};

function getColorClasses(color: string | null | undefined): string {
  if (color && COLLECTION_COLORS[color]) return COLLECTION_COLORS[color];
  return "bg-blue-500/15 text-blue-400";
}

export function CollectionCard({
  collection,
  onClick,
  onTogglePin,
  onDelete,
}: {
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
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-3 p-4 bg-surface-container ghost-border rounded-xl hover:bg-surface-bright hover:border-white/20 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${getColorClasses(collection.color)}`}
        >
          <Folder className="h-[18px] w-[18px]" />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-container-high rounded text-outline hover:text-on-surface transition-all"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-surface-container-high rounded-lg shadow-xl border border-white/10 py-1 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-bright transition-colors"
              >
                {collection.pinned ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
                {collection.pinned ? "Unpin" : "Pin"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-200 truncate">
          {collection.name}
        </p>
        <p className="text-[10px] text-outline mt-0.5">
          {collection._count.assets} items
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the quick actions component**

Create `src/components/quick-actions.tsx`:

```tsx
"use client";

import {
  Code,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image,
  FileText,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";

const actions: { type: AssetType; icon: typeof Code; label: string; primary?: boolean }[] = [
  { type: "SNIPPET", icon: Code, label: "Snippet", primary: true },
  { type: "PROMPT", icon: Terminal, label: "Prompt" },
  { type: "LINK", icon: LinkIcon, label: "Link" },
  { type: "NOTE", icon: StickyNote, label: "Note" },
  { type: "IMAGE", icon: Image, label: "Image" },
  { type: "FILE", icon: FileText, label: "File" },
];

export function QuickActions({
  onAction,
}: {
  onAction: (type: AssetType) => void;
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => onAction(action.type)}
          className={`group flex flex-col items-center justify-center gap-2 p-4 ghost-border rounded-xl transition-all text-center ${
            action.primary
              ? "bg-primary-container/10 hover:bg-primary-container/20 hover:border-primary/40"
              : "bg-surface-container hover:bg-surface-bright hover:border-white/20"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg group-hover:scale-110 transition-transform ${
              action.primary
                ? "bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/30"
                : "bg-surface-container-highest text-on-surface"
            }`}
          >
            <action.icon className="h-5 w-5" />
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${
              action.primary
                ? "text-on-primary-container"
                : "text-on-surface-variant"
            }`}
          >
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create the delete dialog component**

Create `src/components/delete-dialog.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";

export function DeleteDialog({
  open,
  title,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-surface-container-high rounded-xl p-6 w-[360px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Delete &ldquo;{title}&rdquo;?
            </h3>
            <p className="text-xs text-outline mt-1 leading-relaxed">
              This action cannot be undone. The item will be permanently removed
              from your vault.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-error/20 hover:bg-error/30 border border-error/30 hover:border-error/50 rounded text-xs font-bold uppercase tracking-widest text-error transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create the collection modal component**

Create `src/components/collection-modal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const COLOR_OPTIONS = [
  { value: "#3b82f6", label: "Blue", className: "bg-blue-500" },
  { value: "#a855f7", label: "Purple", className: "bg-purple-500" },
  { value: "#10b981", label: "Green", className: "bg-emerald-500" },
  { value: "#f59e0b", label: "Amber", className: "bg-amber-500" },
  { value: "#ef4444", label: "Red", className: "bg-red-500" },
  { value: "#ec4899", label: "Pink", className: "bg-pink-500" },
];

export function CollectionModal({
  open,
  onClose,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<void>;
  initialData?: { name: string; description?: string; color?: string };
}) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [color, setColor] = useState(initialData?.color ?? "#3b82f6");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
    });
    setLoading(false);
    setName("");
    setDescription("");
    setColor("#3b82f6");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high rounded-xl p-6 w-[400px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-slate-100 mb-4">
          {initialData ? "Edit Collection" : "New Collection"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
              placeholder="Collection name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-8 w-8 rounded-full ${opt.className} transition-all ${
                    color === opt.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-high scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initialData ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/asset-card.tsx src/components/collection-card.tsx src/components/quick-actions.tsx src/components/delete-dialog.tsx src/components/collection-modal.tsx
git commit -m "feat: add shared UI components (asset card, collection card, quick actions, dialogs)"
```

---

## Task 11: Monaco Editor and Markdown Preview Components

**Files:**
- Create: `src/components/monaco-editor.tsx`
- Create: `src/components/markdown-preview.tsx`
- Create: `src/components/file-dropzone.tsx`

- [ ] **Step 1: Create the Monaco editor wrapper**

Create `src/components/monaco-editor.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-container-lowest rounded-b-xl">
      <p className="text-xs text-outline animate-pulse">Loading editor...</p>
    </div>
  ),
});

export function MonacoEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}) {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange?.(val ?? "")}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        lineHeight: 1.7,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        scrollbar: {
          verticalScrollbarSize: 4,
          horizontalScrollbarSize: 4,
        },
      }}
    />
  );
}
```

- [ ] **Step 2: Create the markdown preview component**

Create `src/components/markdown-preview.tsx`:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none p-6 overflow-y-auto h-full prose-headings:text-slate-100 prose-p:text-on-surface-variant prose-a:text-primary prose-code:text-primary prose-code:bg-surface-container prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-surface-container-lowest prose-pre:border prose-pre:border-white/5 prose-strong:text-slate-200 prose-li:text-on-surface-variant">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: Create the file dropzone component**

Create `src/components/file-dropzone.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, File } from "lucide-react";

export function FileDropzone({
  onUpload,
  accept,
}: {
  onUpload: (data: {
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) => void;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: globalThis.File) {
    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      onUpload(data);
    }
    setUploading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-outline-variant/30 hover:border-outline-variant/60"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {uploading ? (
        <>
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-xs text-outline">Uploading {fileName}...</p>
        </>
      ) : fileName ? (
        <>
          <File className="h-8 w-8 text-primary" />
          <p className="text-xs text-slate-200">{fileName}</p>
          <p className="text-[10px] text-outline">Click to replace</p>
        </>
      ) : (
        <>
          <Upload className="h-8 w-8 text-outline" />
          <p className="text-xs text-on-surface-variant">
            Drop a file here or click to browse
          </p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/monaco-editor.tsx src/components/markdown-preview.tsx src/components/file-dropzone.tsx
git commit -m "feat: add Monaco editor, markdown preview, and file dropzone components"
```

---

## Task 12: Asset Drawer

**Files:**
- Create: `src/components/asset-drawer.tsx`

- [ ] **Step 1: Create the asset drawer component**

Create `src/components/asset-drawer.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  X,
  Pencil,
  Trash2,
  Save,
  Copy,
  ExternalLink,
  Eye,
  Code,
  Download,
} from "lucide-react";
import {
  FileCode,
  Terminal,
  Link as LinkIcon,
  StickyNote,
  Image as ImageIcon,
  FileText,
  Braces,
} from "lucide-react";
import { AssetType } from "@/generated/prisma";
import { MonacoEditor } from "./monaco-editor";
import { MarkdownPreview } from "./markdown-preview";
import { FileDropzone } from "./file-dropzone";
import { createAsset, updateAsset } from "@/app/actions/assets";

const TYPE_CONFIG: Record<
  AssetType,
  {
    icon: typeof FileCode;
    badge: string;
    iconWrap: string;
    defaultLanguage: string;
  }
> = {
  SNIPPET: {
    icon: Braces,
    badge: "text-primary bg-primary/10",
    iconWrap: "bg-primary/10 text-primary",
    defaultLanguage: "javascript",
  },
  PROMPT: {
    icon: Terminal,
    badge: "text-tertiary bg-tertiary/10",
    iconWrap: "bg-tertiary-container/20 text-tertiary",
    defaultLanguage: "markdown",
  },
  NOTE: {
    icon: StickyNote,
    badge: "text-amber-400 bg-amber-500/10",
    iconWrap: "bg-amber-500/10 text-amber-400",
    defaultLanguage: "markdown",
  },
  LINK: {
    icon: LinkIcon,
    badge: "text-cyan-400 bg-cyan-500/10",
    iconWrap: "bg-cyan-500/10 text-cyan-400",
    defaultLanguage: "plaintext",
  },
  IMAGE: {
    icon: ImageIcon,
    badge: "text-rose-400 bg-rose-500/10",
    iconWrap: "bg-rose-500/10 text-rose-400",
    defaultLanguage: "plaintext",
  },
  FILE: {
    icon: FileText,
    badge: "text-violet-400 bg-violet-500/10",
    iconWrap: "bg-violet-500/10 text-violet-400",
    defaultLanguage: "plaintext",
  },
};

type Asset = {
  id: string;
  type: AssetType;
  title: string;
  description?: string | null;
  content?: string | null;
  language?: string | null;
  url?: string | null;
  filePath?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  updatedAt: Date;
};

export function AssetDrawer({
  open,
  onClose,
  asset,
  mode,
  defaultType,
  onSaved,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  asset?: Asset | null;
  mode: "view" | "edit" | "create";
  defaultType?: AssetType;
  onSaved?: () => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(mode === "edit" || mode === "create");
  const [title, setTitle] = useState(asset?.title ?? "");
  const [content, setContent] = useState(asset?.content ?? "");
  const [language, setLanguage] = useState(asset?.language ?? "javascript");
  const [url, setUrl] = useState(asset?.url ?? "");
  const [type, setType] = useState<AssetType>(
    asset?.type ?? defaultType ?? "SNIPPET"
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // File upload state
  const [fileData, setFileData] = useState<{
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null>(null);

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setContent(asset.content ?? "");
      setLanguage(asset.language ?? "javascript");
      setUrl(asset.url ?? "");
      setType(asset.type);
    } else {
      setTitle("");
      setContent("");
      setLanguage("javascript");
      setUrl("");
      setType(defaultType ?? "SNIPPET");
      setFileData(null);
    }
    setEditing(mode === "edit" || mode === "create");
    setShowPreview(false);
  }, [asset, mode, defaultType]);

  async function handleSave() {
    setSaving(true);
    if (mode === "create") {
      await createAsset({
        type,
        title,
        content: ["SNIPPET", "PROMPT", "NOTE"].includes(type)
          ? content
          : undefined,
        language: type === "SNIPPET" ? language : undefined,
        url: type === "LINK" ? url : undefined,
        filePath: fileData?.filePath,
        fileName: fileData?.fileName,
        mimeType: fileData?.mimeType,
        fileSize: fileData?.fileSize,
      });
    } else if (asset) {
      await updateAsset(asset.id, {
        title,
        content: ["SNIPPET", "PROMPT", "NOTE"].includes(type)
          ? content
          : undefined,
        language: type === "SNIPPET" ? language : undefined,
        url: type === "LINK" ? url : undefined,
      });
    }
    setSaving(false);
    setEditing(false);
    onSaved?.();
  }

  function handleCancel() {
    if (mode === "create") {
      onClose();
    } else {
      setEditing(false);
      setTitle(asset?.title ?? "");
      setContent(asset?.content ?? "");
      setLanguage(asset?.language ?? "javascript");
      setUrl(asset?.url ?? "");
    }
  }

  if (!open) return null;

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const isTextType = ["SNIPPET", "PROMPT", "NOTE"].includes(type);
  const isFileType = ["IMAGE", "FILE"].includes(type);
  const isLink = type === "LINK";
  const isMarkdown = type === "PROMPT" || type === "NOTE";
  const editorLanguage =
    type === "SNIPPET" ? language : isMarkdown ? "markdown" : "plaintext";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        style={{ backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[680px] flex flex-col z-50 bg-surface-container-low shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/5 shrink-0">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconWrap}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-base font-bold text-slate-100 border-none focus:ring-0 focus:outline-none p-0 placeholder:text-outline/50"
                  placeholder="Asset title..."
                  autoFocus
                />
              ) : (
                <h2 className="text-base font-bold text-slate-100 truncate leading-tight">
                  {title}
                </h2>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {mode === "create" ? (
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssetType)}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="SNIPPET">Snippet</option>
                    <option value="PROMPT">Prompt</option>
                    <option value="NOTE">Note</option>
                    <option value="LINK">Link</option>
                    <option value="IMAGE">Image</option>
                    <option value="FILE">File</option>
                  </select>
                ) : (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${config.badge}`}
                  >
                    {type}
                  </span>
                )}
                {type === "SNIPPET" && editing && (
                  <input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-surface-container border border-white/5 text-outline w-24 focus:ring-1 focus:ring-primary/50"
                    placeholder="language"
                  />
                )}
                {type === "SNIPPET" && !editing && asset?.language && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline bg-surface-container px-2 py-0.5 rounded border border-white/5">
                    {asset.language}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4 shrink-0">
            {mode !== "create" && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all border border-transparent hover:border-white/10"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {mode !== "create" && onDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-outline hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isTextType && (
            <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6 pt-2">
              {/* Preview toggle for markdown types */}
              {isMarkdown && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      !showPreview
                        ? "text-primary bg-primary/10"
                        : "text-outline hover:text-on-surface-variant"
                    }`}
                  >
                    <Code className="h-3 w-3" />
                    Code
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
                      showPreview
                        ? "text-primary bg-primary/10"
                        : "text-outline hover:text-on-surface-variant"
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                </div>
              )}
              <div
                className="flex-1 overflow-hidden rounded-xl flex flex-col"
                style={{ minHeight: 0 }}
              >
                {/* Mac-style editor chrome */}
                <div className="flex items-center gap-2 px-4 h-9 bg-surface-bright border-b border-white/5 rounded-t-xl select-none shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
                  </div>
                  <span className="flex-1 text-center text-[11px] text-outline font-mono">
                    {title || "untitled"}
                  </span>
                  <span className="text-[10px] text-outline/60 font-mono">
                    {editorLanguage}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden rounded-b-xl bg-surface-container-lowest">
                  {showPreview && isMarkdown ? (
                    <MarkdownPreview content={content} />
                  ) : (
                    <MonacoEditor
                      value={content}
                      onChange={editing ? setContent : undefined}
                      language={editorLanguage}
                      readOnly={!editing}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {isLink && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <LinkIcon className="h-7 w-7" />
              </div>
              <div className="text-center w-full max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                  URL
                </p>
                {editing ? (
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-surface-container ghost-border rounded-lg px-4 py-3 text-sm font-mono text-slate-200 focus:ring-1 focus:ring-primary/50 border-none"
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 bg-surface-container ghost-border rounded-lg px-4 py-3">
                    <LinkIcon className="h-4 w-4 text-outline shrink-0" />
                    <p className="text-sm font-mono text-slate-200 break-all text-left flex-1">
                      {url}
                    </p>
                  </div>
                )}
              </div>
              {!editing && url && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(url)}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container ghost-border rounded text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary/20 hover:bg-primary-container/40 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Link
                  </a>
                </div>
              )}
            </div>
          )}

          {isFileType && (
            <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
              {mode === "create" || (!asset?.filePath && editing) ? (
                <FileDropzone
                  onUpload={setFileData}
                  accept={type === "IMAGE" ? "image/*" : undefined}
                />
              ) : asset?.filePath ? (
                <>
                  {type === "IMAGE" && asset.mimeType?.startsWith("image/") ? (
                    <img
                      src={`/api/files/${asset.filePath}`}
                      alt={asset.title}
                      className="max-h-80 max-w-full rounded-xl object-contain"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                      <FileText className="h-10 w-10" />
                    </div>
                  )}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-200">
                      {asset.fileName}
                    </p>
                    <p className="text-[10px] text-outline">
                      {asset.mimeType}
                      {asset.fileSize &&
                        ` • ${(asset.fileSize / 1024).toFixed(1)} KB`}
                    </p>
                  </div>
                  <a
                    href={`/api/files/${asset.filePath}`}
                    download={asset.fileName}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-container/20 border border-primary/20 hover:bg-primary-container/40 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </>
              ) : null}
            </div>
          )}
        </div>

        {/* Edit/Create footer */}
        {editing && (
          <div className="flex items-center justify-end px-6 py-4 border-t border-white/5 shrink-0 gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-slate-100 hover:bg-surface-bright rounded transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/asset-drawer.tsx
git commit -m "feat: add asset drawer with view, edit, and create modes"
```

---

## Task 13: Dashboard Page

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`
- Create: `src/app/(app)/dashboard/dashboard-client.tsx`

- [ ] **Step 1: Create the dashboard client component**

Create `src/app/(app)/dashboard/dashboard-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssetType } from "@/generated/prisma";
import { QuickActions } from "@/components/quick-actions";
import { AssetCard } from "@/components/asset-card";
import { CollectionCard } from "@/components/collection-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { DeleteDialog } from "@/components/delete-dialog";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";
import { toggleCollectionPin, deleteCollection } from "@/app/actions/collections";
import { Pin, FolderOpen, Clock } from "lucide-react";

type DashboardAsset = {
  id: string;
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
  updatedAt: Date;
};

type DashboardCollection = {
  id: string;
  name: string;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
};

export function DashboardClient({
  pinnedAssets,
  pinnedCollections,
  recentAssets,
}: {
  pinnedAssets: DashboardAsset[];
  pinnedCollections: DashboardCollection[];
  recentAssets: DashboardAsset[];
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [selectedAsset, setSelectedAsset] = useState<DashboardAsset | null>(
    null
  );
  const [defaultType, setDefaultType] = useState<AssetType>("SNIPPET");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "asset" | "collection";
    id: string;
    title: string;
  } | null>(null);

  async function handleAssetClick(asset: DashboardAsset) {
    const full = await getAsset(asset.id);
    if (full) {
      setSelectedAsset(full as DashboardAsset);
      setDrawerMode("view");
      setDrawerOpen(true);
    }
  }

  function handleQuickAction(type: AssetType) {
    setSelectedAsset(null);
    setDefaultType(type);
    setDrawerMode("create");
    setDrawerOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "asset") {
      await deleteAsset(deleteTarget.id);
    } else {
      await deleteCollection(deleteTarget.id);
    }
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-12">
      {/* Quick Actions */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Quick Actions
          </h2>
          <p className="text-xs text-outline">
            Instant access to creation tools.
          </p>
        </div>
        <QuickActions onAction={handleQuickAction} />
      </section>

      {/* Pinned Assets */}
      {pinnedAssets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Pin className="h-5 w-5 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
                Pinned Assets
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            {pinnedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => handleAssetClick(asset)}
                onTogglePin={async () => {
                  await togglePin(asset.id);
                  router.refresh();
                }}
                onDelete={() =>
                  setDeleteTarget({
                    type: "asset",
                    id: asset.id,
                    title: asset.title,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Pinned Collections */}
      {pinnedCollections.length > 0 && (
        <section className="!mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
                Pinned Collections
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pinnedCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() =>
                  router.push(`/collections/${collection.id}`)
                }
                onTogglePin={async () => {
                  await toggleCollectionPin(collection.id);
                  router.refresh();
                }}
                onDelete={() =>
                  setDeleteTarget({
                    type: "collection",
                    id: collection.id,
                    title: collection.name,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent Assets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-outline" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface">
              Recent Assets
            </h3>
          </div>
        </div>
        <div className="space-y-1">
          {recentAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              compact
              onClick={() => handleAssetClick(asset)}
              onTogglePin={async () => {
                await togglePin(asset.id);
                router.refresh();
              }}
              onDelete={() =>
                setDeleteTarget({
                  type: "asset",
                  id: asset.id,
                  title: asset.title,
                })
              }
            />
          ))}
          {recentAssets.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-outline">
                No assets yet. Create one above!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Drawer */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
        mode={drawerMode}
        defaultType={defaultType}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
        onDelete={
          selectedAsset
            ? () => {
                setDrawerOpen(false);
                setDeleteTarget({
                  type: "asset",
                  id: selectedAsset.id,
                  title: selectedAsset.title,
                });
              }
            : undefined
        }
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update the dashboard page to fetch data**

Replace `src/app/(app)/dashboard/page.tsx`:

```tsx
import { getDashboardData } from "@/app/actions/assets";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <DashboardClient
      pinnedAssets={data.pinnedAssets}
      pinnedCollections={data.pinnedCollections}
      recentAssets={data.recentAssets}
    />
  );
}
```

- [ ] **Step 3: Test the dashboard**

```bash
npm run dev
```

1. Sign in and land on the dashboard
2. Quick actions should render 6 buttons
3. Clicking a quick action should open the drawer in create mode
4. Create a snippet — fill title, paste some code, save
5. It should appear in the "Recent Assets" section
6. Click it — the drawer opens in view mode with Monaco showing the code

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/dashboard/
git commit -m "feat: add dashboard page with quick actions, pinned items, and recent assets"
```

---

## Task 14: Assets Page (All Items)

**Files:**
- Create: `src/app/(app)/assets/page.tsx`
- Create: `src/app/(app)/assets/assets-client.tsx`

- [ ] **Step 1: Create the assets client component**

Create `src/app/(app)/assets/assets-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AssetType } from "@/generated/prisma";
import { AssetCard } from "@/components/asset-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { DeleteDialog } from "@/components/delete-dialog";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";

const TYPE_TABS: { label: string; value: AssetType | null }[] = [
  { label: "All", value: null },
  { label: "Snippets", value: "SNIPPET" },
  { label: "Prompts", value: "PROMPT" },
  { label: "Notes", value: "NOTE" },
  { label: "Links", value: "LINK" },
  { label: "Images", value: "IMAGE" },
  { label: "Files", value: "FILE" },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "A → Z", value: "az" },
  { label: "Z → A", value: "za" },
];

type AssetItem = {
  id: string;
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
  updatedAt: Date;
};

export function AssetsClient({
  assets,
  currentType,
  currentSort,
  searchQuery,
}: {
  assets: AssetItem[];
  currentType: AssetType | null;
  currentSort: string;
  searchQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val === null) params.delete(key);
      else params.set(key, val);
    }
    router.push(`/assets?${params.toString()}`);
  }

  async function handleAssetClick(asset: AssetItem) {
    const full = await getAsset(asset.id);
    if (full) {
      setSelectedAsset(full as AssetItem);
      setDrawerMode("view");
      setDrawerOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          {searchQuery
            ? `Search: "${searchQuery}"`
            : currentType
              ? `${currentType.charAt(0) + currentType.slice(1).toLowerCase()}s`
              : "All Items"}
        </h2>
        <p className="text-xs text-outline mt-1">
          {assets.length} item{assets.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() =>
                updateParams({ type: tab.value, q: null })
              }
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                currentType === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-outline hover:text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded bg-surface-container border-none text-on-surface-variant focus:ring-1 focus:ring-primary/50"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onClick={() => handleAssetClick(asset)}
            onTogglePin={async () => {
              await togglePin(asset.id);
              router.refresh();
            }}
            onDelete={() =>
              setDeleteTarget({ id: asset.id, title: asset.title })
            }
          />
        ))}
        {assets.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xs text-outline">
              {searchQuery
                ? "No results found."
                : "No assets yet. Create one from the dashboard!"}
            </p>
          </div>
        )}
      </div>

      {/* Drawer */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
        mode={drawerMode}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
        onDelete={
          selectedAsset
            ? () => {
                setDrawerOpen(false);
                setDeleteTarget({
                  id: selectedAsset.id,
                  title: selectedAsset.title,
                });
              }
            : undefined
        }
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create the assets server page**

Create `src/app/(app)/assets/page.tsx`:

```tsx
import { AssetType } from "@/generated/prisma";
import { getAssets } from "@/app/actions/assets";
import { AssetsClient } from "./assets-client";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    sort?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const type = (params.type as AssetType) || null;
  const sort = params.sort || "newest";
  const q = params.q || "";

  const assets = await getAssets({
    type: type ?? undefined,
    sort: sort as "newest" | "oldest" | "az" | "za",
    q: q || undefined,
  });

  return (
    <AssetsClient
      assets={assets}
      currentType={type}
      currentSort={sort}
      searchQuery={q}
    />
  );
}
```

- [ ] **Step 3: Test the assets page**

```bash
npm run dev
```

1. Navigate to `/assets` — should show all items
2. Filter tabs should work — click "Snippets" to filter
3. Sidebar links (Snippets, Prompts, etc.) should navigate to `/assets?type=X`
4. Search from header should navigate to `/assets?q=X`
5. Sort dropdown should reorder items

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/assets/
git commit -m "feat: add assets page with type filters, sort, and search"
```

---

## Task 15: Collections Pages

**Files:**
- Create: `src/app/(app)/collections/page.tsx`
- Create: `src/app/(app)/collections/collections-client.tsx`
- Create: `src/app/(app)/collections/[id]/page.tsx`
- Create: `src/app/(app)/collections/[id]/collection-detail-client.tsx`

- [ ] **Step 1: Create the collections client component**

Create `src/app/(app)/collections/collections-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionCard } from "@/components/collection-card";
import { CollectionModal } from "@/components/collection-modal";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  createCollection,
  toggleCollectionPin,
  deleteCollection,
} from "@/app/actions/collections";

type CollectionItem = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  pinned: boolean;
  _count: { assets: number };
};

export function CollectionsClient({
  collections,
}: {
  collections: CollectionItem[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteCollection(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Collections
          </h2>
          <p className="text-xs text-outline mt-1">
            {collections.length} collection
            {collections.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container/20 hover:bg-primary-container/40 border border-primary/20 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all"
        >
          New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            onClick={() => router.push(`/collections/${collection.id}`)}
            onTogglePin={async () => {
              await toggleCollectionPin(collection.id);
              router.refresh();
            }}
            onDelete={() =>
              setDeleteTarget({ id: collection.id, name: collection.name })
            }
          />
        ))}
      </div>

      {collections.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-xs text-outline">
            No collections yet. Create one to organize your assets.
          </p>
        </div>
      )}

      <CollectionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          await createCollection(data);
          router.refresh();
        }}
      />

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.name ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create the collections server page**

Create `src/app/(app)/collections/page.tsx`:

```tsx
import { getCollections } from "@/app/actions/collections";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return <CollectionsClient collections={collections} />;
}
```

- [ ] **Step 3: Create the collection detail client component**

Create `src/app/(app)/collections/[id]/collection-detail-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AssetCard } from "@/components/asset-card";
import { AssetDrawer } from "@/components/asset-drawer";
import { DeleteDialog } from "@/components/delete-dialog";
import { togglePin, deleteAsset, getAsset } from "@/app/actions/assets";
import { removeAssetFromCollection } from "@/app/actions/collections";
import { AssetType } from "@/generated/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type AssetItem = {
  id: string;
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
  updatedAt: Date;
};

type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  assets: { asset: AssetItem }[];
  _count: { assets: number };
};

export function CollectionDetailClient({
  collection,
}: {
  collection: CollectionDetail;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  async function handleAssetClick(asset: AssetItem) {
    const full = await getAsset(asset.id);
    if (full) {
      setSelectedAsset(full as AssetItem);
      setDrawerOpen(true);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteAsset(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  const assets = collection.assets.map((ac) => ac.asset);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/collections"
          className="flex items-center gap-1 text-xs text-outline hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Collections
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          {collection.name}
        </h2>
        {collection.description && (
          <p className="text-xs text-outline mt-1">
            {collection.description}
          </p>
        )}
        <p className="text-xs text-outline mt-1">
          {collection._count.assets} item
          {collection._count.assets !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onClick={() => handleAssetClick(asset)}
            onTogglePin={async () => {
              await togglePin(asset.id);
              router.refresh();
            }}
            onDelete={() =>
              setDeleteTarget({ id: asset.id, title: asset.title })
            }
          />
        ))}
        {assets.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-xs text-outline">
              This collection is empty.
            </p>
          </div>
        )}
      </div>

      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        asset={selectedAsset}
        mode="view"
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
        onDelete={
          selectedAsset
            ? () => {
                setDrawerOpen(false);
                setDeleteTarget({
                  id: selectedAsset.id,
                  title: selectedAsset.title,
                });
              }
            : undefined
        }
      />

      <DeleteDialog
        open={!!deleteTarget}
        title={deleteTarget?.title ?? ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Create the collection detail server page**

Create `src/app/(app)/collections/[id]/page.tsx`:

```tsx
import { getCollection } from "@/app/actions/collections";
import { CollectionDetailClient } from "./collection-detail-client";
import { notFound } from "next/navigation";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  return <CollectionDetailClient collection={collection} />;
}
```

- [ ] **Step 5: Test the collections pages**

```bash
npm run dev
```

1. Navigate to `/collections` — should show empty state
2. Create a collection — form modal should work
3. Navigate into the collection — should show empty
4. Go back to dashboard, create some assets, then navigate back

- [ ] **Step 6: Commit**

```bash
git add src/app/(app)/collections/
git commit -m "feat: add collections page and collection detail page"
```

---

## Task 16: Settings Page

**Files:**
- Create: `src/app/(app)/settings/page.tsx`
- Create: `src/app/(app)/settings/settings-client.tsx`

- [ ] **Step 1: Create the settings client component**

Create `src/app/(app)/settings/settings-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function SettingsClient({
  user,
}: {
  user: { name: string; email: string; image?: string | null };
}) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    await authClient.updateUser({ name });
    setSaving(false);
    setMessage("Profile updated.");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Settings
        </h2>
        <p className="text-xs text-outline mt-1">
          Manage your profile and account.
        </p>
      </div>

      <section>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface mb-4">
          Profile
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-outline cursor-not-allowed"
            />
          </div>
          {message && (
            <p className="text-xs text-emerald-400">{message}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-container/30 hover:bg-primary-container/50 border border-primary/30 hover:border-primary/50 rounded text-xs font-bold uppercase tracking-widest text-primary transition-all disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Changes
          </button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create the settings server page**

Create `src/app/(app)/settings/page.tsx`:

```tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) redirect("/sign-in");

  return (
    <SettingsClient
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/settings/
git commit -m "feat: add settings page with profile management"
```

---

## Task 17: Wire Up App Shell — Collection Modal and Drawer from Header

**Files:**
- Modify: `src/app/(app)/app-shell.tsx`

- [ ] **Step 1: Update app-shell to wire up header actions to drawer and collection modal**

Replace the contents of `src/app/(app)/app-shell.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarCollapsedToggle } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AssetDrawer } from "@/components/asset-drawer";
import { CollectionModal } from "@/components/collection-modal";
import { createCollection } from "@/app/actions/collections";
import { AssetType } from "@/generated/prisma";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; image?: string | null };
}) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  function handleAddItem() {
    setDrawerOpen(true);
  }

  function handleAddCollection() {
    setCollectionModalOpen(true);
  }

  return (
    <div className="flex h-full">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />
      <main className="flex-1 flex flex-col min-w-0 bg-surface h-full">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          sidebarCollapsed={sidebarCollapsed}
          sidebarToggle={
            <SidebarCollapsedToggle
              onToggle={() => setSidebarCollapsed(false)}
            />
          }
          onAddItem={handleAddItem}
          onAddCollection={handleAddCollection}
        />
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>

      {/* Global "Add Item" drawer from header */}
      <AssetDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode="create"
        defaultType={"SNIPPET" as AssetType}
        onSaved={() => {
          setDrawerOpen(false);
          router.refresh();
        }}
      />

      {/* Global "New Collection" modal from header */}
      <CollectionModal
        open={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        onSubmit={async (data) => {
          await createCollection(data);
          router.refresh();
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Test the full integration**

```bash
npm run dev
```

1. "Add Item" button in header → opens create drawer
2. "Collection" button in header → opens create collection modal
3. Create assets and collections, navigate between pages
4. All sidebar links work correctly
5. Search from header navigates to `/assets?q=X`

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/app-shell.tsx
git commit -m "feat: wire up header actions to global drawer and collection modal"
```

---

## Task 18: Final Polish — Mobile Bottom Nav and Cleanup

**Files:**
- Modify: `src/app/(app)/app-shell.tsx` (add mobile nav)
- Remove: `src/app/page.tsx` (if not already removed)

- [ ] **Step 1: Add mobile bottom navigation to app-shell**

Add the mobile bottom nav before the closing `</>` in `app-shell.tsx`, just after the `CollectionModal`:

```tsx
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-4 z-50">
        <a href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Dash</span>
        </a>
        <a href="/assets" className="flex flex-col items-center gap-1 text-outline">
          <Package className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Items</span>
        </a>
        <div className="-mt-8">
          <button
            onClick={handleAddItem}
            className="flex h-12 w-12 items-center justify-center rounded-full btn-gradient shadow-xl shadow-primary-container/40 text-on-primary"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <a href="/collections" className="flex flex-col items-center gap-1 text-outline">
          <Folder className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Collections</span>
        </a>
        <a href="/settings" className="flex flex-col items-center gap-1 text-outline">
          <Settings className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Settings</span>
        </a>
      </nav>
```

Add the required imports at the top of `app-shell.tsx`:

```tsx
import { LayoutDashboard, Package, Folder, Settings, Plus } from "lucide-react";
```

- [ ] **Step 2: Verify the mobile bottom nav in dev tools**

```bash
npm run dev
```

Open Chrome DevTools, toggle mobile viewport. The bottom nav should render with the floating "+" button.

- [ ] **Step 3: Verify the full app works end-to-end**

Test these flows:

1. Sign up with email/password
2. Land on dashboard — empty state
3. Create a snippet via quick action
4. Create a note via quick action
5. Create a link via quick action
6. Create a collection
7. Pin an asset — appears in pinned section
8. Navigate to `/assets` — filter by type
9. Search from header
10. Navigate to `/collections` — see the collection
11. Click into collection detail
12. Open Settings — update name
13. Sign out and sign back in

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/app-shell.tsx
git commit -m "feat: add mobile bottom navigation"
```

---

## Task 19: Type Check and Build Verification

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Fix any type errors that come up.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Fix any build errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Fix any lint errors.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve type check and build errors"
```
