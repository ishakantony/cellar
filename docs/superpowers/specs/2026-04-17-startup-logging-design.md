# Startup Logging Design Spec

**Date:** 2026-04-17
**Author:** OpenCode AI Agent
**Status:** Draft

---

## 1. Overview

Add a structured startup diagnostics report to the Cellar Next.js app so developers can quickly confirm the active runtime configuration when the server boots. The report should surface key environment-driven settings that are useful for debugging while ensuring sensitive values are never emitted in plain text.

### 1.1 Goals

- Print a grouped startup report when a new Next.js server instance starts
- Surface the runtime, database, auth, and upload settings that matter most for debugging
- Mask or summarize sensitive values instead of logging them directly
- Keep the change aligned with Next.js 16 startup conventions
- Make the output deterministic and easy to scan in local development and production

### 1.2 Non-Goals

- Logging every environment variable automatically
- Replacing existing runtime validation in auth, Prisma, or route modules
- Adding external logging infrastructure or OpenTelemetry exporters
- Changing how `npm run dev` or `npm run start` launch the app

---

## 2. Selected Approach

### 2.1 Recommended Architecture

Use Next.js' supported startup hook via `src/instrumentation.ts` and call a dedicated startup-report helper from `register()`.

This approach is preferred because:

- it follows the documented Next.js 16 server startup lifecycle
- it keeps the current `next dev` and `next start` entrypoints unchanged
- it centralizes startup diagnostics in one place instead of scattering logs across Prisma, auth, and route modules
- it gives the app a single predictable startup snapshot before requests are handled

### 2.2 Rejected Alternatives

**Custom wrapper script around `next dev` / `next start`**

- Pros: full control over output ordering
- Cons: more invasive, changes startup behavior, easier to drift from framework expectations

**Lazy logging from existing modules**

- Pros: less framework-specific wiring
- Cons: fragmented output, inconsistent timing, no single startup snapshot

---

## 3. Design

### 3.1 New Modules

Add the following files:

- `src/instrumentation.ts`
- `src/lib/startup-report.ts`
- `src/lib/startup-report.test.ts`

### 3.2 Responsibilities

**`src/instrumentation.ts`**

- export `register()`
- call the startup report once when a new Next.js server instance initializes
- avoid embedding formatting logic directly in the hook

**`src/lib/startup-report.ts`**

- collect a fixed allowlist of startup diagnostics
- derive safe display values from raw env vars
- render a grouped text report
- guard against duplicate logging within the same server instance

### 3.3 Output Structure

The report should use grouped sections in this order:

1. `Runtime`
2. `Database`
3. `Auth`
4. `Uploads`

Example shape:

```text
[cellar] Startup configuration
  Runtime
    NODE_ENV: development
    PORT: 3000
    E2E_TEST_MODE: false
  Database
    DATABASE_URL: postgresql://localhost:5432/cellar
  Auth
    BETTER_AUTH_URL: http://localhost:3000
    BETTER_AUTH_TRUSTED_ORIGINS: 2 origins [http://localhost:3000, https://cellar.example.com]
    BETTER_AUTH_SECRET: abcd...wxyz (length 44, sha256:1a2b3c4d)
    GITHUB_CLIENT_ID: gh_12...9f0z (length 20, sha256:9e8d7c6b)
    GITHUB_CLIENT_SECRET: abcd...wxyz (length 40, sha256:4f3e2d1c)
  Uploads
    UPLOAD_DIR: ./uploads
    MAX_FILE_SIZE: 10485760
```

The exact formatting can differ slightly, but it must remain compact, grouped, and easy to scan in a terminal.

---

## 4. Masking Rules

### 4.1 Allowlist Only

The report must only include explicitly approved settings:

- `NODE_ENV`
- `PORT`
- `E2E_TEST_MODE`
- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_TRUSTED_ORIGINS`
- `BETTER_AUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `UPLOAD_DIR`
- `MAX_FILE_SIZE`

This avoids accidental exposure from future environment additions.

### 4.2 Per-Field Display Rules

**Runtime**

- `NODE_ENV`: display directly, fall back to `development` or `production` only if that is already implied by the active process state
- `PORT`: display the effective port if available, otherwise `default (3000)`
- `E2E_TEST_MODE`: display `true` or `false`

**Database**

- `DATABASE_URL`: parse and display only safe derived parts
- include provider, host, port, and database name
- do not display username, password, query params, or the raw connection string
- if parsing fails, display `present (unparseable)` or `missing`

Recommended rendered form:

```text
postgresql host=localhost port=5432 db=cellar
```

**Auth**

- `BETTER_AUTH_URL`: display directly
- `BETTER_AUTH_TRUSTED_ORIGINS`: display a parsed summary of configured origins
- `BETTER_AUTH_SECRET`: display `missing` or a masked preview with length and short fingerprint
- `GITHUB_CLIENT_ID`: display `missing` or a masked preview with length and short fingerprint
- `GITHUB_CLIENT_SECRET`: display `missing` or a masked preview with length and short fingerprint

Recommended rendered form for trusted origins:

```text
2 origins [http://localhost:3000, https://cellar.example.com]
```

Trusted origins rules:

- treat the value as operational configuration, not as a secret
- if the env var contains multiple origins, parse and display each origin in a stable order
- include the number of configured origins
- if parsing fails, display `present (unparseable)`
- if missing, display `missing` or `not configured`

Recommended rendered form for secret-like values:

```text
abcd...wxyz (length 40, sha256:1a2b3c4d)
```

Masking rules:

- show a short prefix and suffix when the value is long enough
- include the original string length
- include a short stable fingerprint derived from the full value so two runs can be compared reliably
- never display the full raw value
- for very short values, prefer a heavily masked representation rather than exposing most of the string

**Uploads**

- `UPLOAD_DIR`: display directly
- `MAX_FILE_SIZE`: display the raw configured value and, if simple, optionally include a human-readable size alongside it

### 4.3 Safety Principle

If a value may contain sensitive content and there is no field-specific masking rule, do not log it. The helper should prefer omission or a coarse status label over a risky best-effort display.

---

## 5. Runtime Behavior

### 5.1 Startup Timing

The report should run from `register()` in `src/instrumentation.ts`, which Next.js calls once per new server instance before the server is ready to handle requests.

### 5.2 Duplicate Prevention

Within a single server instance, the report should print at most once. A module-level or global guard is acceptable.

In development, if Next.js restarts the server instance, the report may print again. That is acceptable and useful because the environment may have changed.

### 5.3 Failure Handling

The startup logger must be non-fatal:

- malformed values should render as `invalid`, `unparseable`, or `missing`
- the logger must not throw if parsing fails
- existing app validation should remain the source of truth for fatal configuration errors

This preserves current behavior such as auth startup validation while still surfacing useful diagnostics.

---

## 6. Testing Strategy

Testing should focus on the helper rather than the framework hook.

### 6.1 Unit Tests

Add tests for:

- grouped rendering of the startup report
- `DATABASE_URL` parsing into safe derived fields
- secret values never appearing raw in output
- masked secret output including preview, length, and fingerprint
- missing and malformed values degrading gracefully
- duplicate prevention logic if it lives in the helper module

### 6.2 Out of Scope for Tests

- integration tests for Next.js calling `register()`
- end-to-end verification of terminal output during `next dev`

These are lower-value than validating the masking and formatting logic directly.

---

## 7. Implementation Notes

- Follow existing project conventions for utility placement under `src/lib`
- Keep the helper small and explicit rather than building a generic logging framework
- Use ASCII-only output for consistency with the rest of the repo
- Prefer stable labels so developers can compare startup output across runs

---

## 8. Success Criteria

The design is successful when:

- the app prints one grouped startup diagnostics block per server instance
- database, auth, upload, and runtime settings are visible at startup
- auth origin allowlist configuration is visible at startup
- no raw secrets or full connection strings are logged
- secret-like values are distinguishable across runs by masked preview plus fingerprint
- malformed or missing values are reported without crashing the logger
- the feature works without changing the app's existing start commands
