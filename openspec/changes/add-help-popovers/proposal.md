## Why

The app uses climbing-specific jargon (onsight, flash, redpoint, French/YDS/V-scale/Font grading systems) that can confuse newcomers and even experienced climbers from other disciplines. There is currently no in-app explanation of these terms — users must already know the terminology to use the forms correctly.

## What Changes

- Add a reusable `HelpPopover` component: a small (?) icon that opens a popover listing term definitions for a field group
- Add the shadcn/ui `Popover` component (requires `@radix-ui/react-popover` dependency)
- Add (?) icons to form labels in `ClimbEntryForm` (completion type, style), `SessionFormPage` (session type), and `GradeSelector` parent labels (grade system)
- Add i18n keys for term descriptions in both `pl.json` and `en.json`
- Display-only contexts (SessionDetailPage, PyramidPage filters) are explicitly excluded — help is only offered where users make selections

## Capabilities

### New Capabilities
- `help-popovers`: Contextual help popovers on form labels explaining climbing terminology groups

### Modified Capabilities
- `i18n`: New translation keys for term descriptions (help text content in PL and EN)

## Impact

- **New dependency**: `@radix-ui/react-popover`
- **New UI component**: `src/components/ui/popover.tsx` (shadcn/ui primitive)
- **New component**: `src/components/HelpPopover.tsx`
- **Modified components**: `ClimbEntryForm.tsx`, `SessionFormPage.tsx`, `GradeSelector.tsx` (or parent label sites)
- **Modified i18n files**: `pl.json`, `en.json` (additive only)
