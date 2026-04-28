## Parent PRD

`issues/prd.md`

## What to build

Fix toast notifications to match the app's dark Material-3 design. Currently `<Toaster richColors />` uses Sonner's hardcoded saturated palette, which clashes with the deep-blue surface tokens. The fix involves three changes in concert: drop `richColors`, add `theme="dark"`, and override Sonner's CSS variables in `packages/ui/src/styles.css` so toasts inherit the app's actual design tokens for backgrounds, text, borders, and semantic colours (success/error).

The CSS variable block targets `[data-sonner-toaster]` and maps `--normal-bg`, `--normal-text`, `--normal-border`, `--success-bg`, `--success-text`, `--success-border`, `--error-bg`, `--error-text`, `--error-border` to values derived from existing tokens (`--color-surface-container-high`, `--color-foreground`, `--color-error`, etc.). Placing the overrides in `packages/ui/src/styles.css` (alongside the design tokens) means Storybook picks them up automatically.

## Acceptance criteria

- [ ] Success toasts use a muted on-brand green, not Sonner's bright default green
- [ ] Error toasts use `--color-error` (currently `#ec7c8a`) as the accent
- [ ] Toast background matches `--color-surface-container-high` (`#16202e`)
- [ ] Toast text is legible against that background using `--color-foreground`
- [ ] Toast border uses a subtle `white/10` or equivalent low-opacity separator
- [ ] `richColors` prop is removed from `<Toaster>` in `main.tsx`
- [ ] `theme="dark"` is set on `<Toaster>` in `main.tsx`
- [ ] Toasts look native in Storybook (CSS variables resolved via `packages/ui/src/styles.css`)

## Blocked by

None — can start immediately.

## User stories addressed

- User story 27
- User story 28
- User story 29
- User story 30
