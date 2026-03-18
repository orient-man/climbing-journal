## 1. Dependencies & UI Primitives

- [x] 1.1 Install `@radix-ui/react-popover` dependency
- [x] 1.2 Add shadcn/ui `Popover` component (`src/components/ui/popover.tsx`)

## 2. HelpPopover Component

- [x] 2.1 Create `src/components/HelpPopover.tsx` — accepts `items: Array<{ term: string; description: string }>`, renders HelpCircle icon button that opens a Popover with a term definition list

## 3. i18n Help Text

- [x] 3.1 Add `help.completionTypes.*` keys (onsight, flash, redpoint, repeat, attempt) to `en.json` and `pl.json`
- [x] 3.2 Add `help.styles.*` keys (lead, boulder, toprope) to `en.json` and `pl.json`
- [x] 3.3 Add `help.sessionTypes.*` keys (lead, boulder, toprope, mixed) to `en.json` and `pl.json`
- [x] 3.4 Add `help.gradeSystems.*` keys (french, yds, vscale, font) to `en.json` and `pl.json`

## 4. Wire Into Form Components

- [x] 4.1 Add HelpPopover to "Completion type" label in `ClimbEntryForm.tsx`
- [x] 4.2 Add HelpPopover to "Style" label in `ClimbEntryForm.tsx`
- [x] 4.3 Add HelpPopover to "Session type" label in `SessionFormPage.tsx`
- [x] 4.4 Add HelpPopover to grade selector parent labels in `ProfileForm.tsx` and `ClimbEntryForm.tsx`

## 5. Verify

- [x] 5.1 Run `npm run build` — no TypeScript errors, no lint errors
- [x] 5.2 Manually verify popovers open/close on all four form fields
