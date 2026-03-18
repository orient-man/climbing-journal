## Context

The climbing journal uses climbing-specific terminology in form fields (completion types, climb styles, session types, grade systems) with no in-app explanations. All form labels follow a consistent `<div className="space-y-2"><Label>...</Label><Control /></div>` pattern. There is no Tooltip or Popover component currently installed. The app runs on mobile (climbers at the crag) where hover-based tooltips don't work.

## Goals / Non-Goals

**Goals:**
- Provide one-liner explanations for non-obvious climbing terms via (?) icons on form labels
- Work well on mobile (tap-to-open, tap-to-dismiss)
- Reusable pattern — easy to add help to any label in the future
- Bilingual (PL/EN) help text via existing i18n system

**Non-Goals:**
- No tooltips in display/read-only contexts (SessionDetailPage, PyramidPage filters)
- No tutorial or onboarding flow
- No help for self-explanatory terms (boulder, gym, repeat, attempt)
- No rich content (images, links) in popovers — plain text only

## Decisions

### 1. Popover over Tooltip

**Choice**: shadcn/ui `Popover` (wrapping `@radix-ui/react-popover`)

**Why**: Tooltips are hover-triggered and unreliable on touch devices. Popovers are click/tap-triggered and dismiss on outside tap — exactly right for mobile-first use at the crag.

**Alternative considered**: Radix Tooltip with `delayDuration={0}` — still fundamentally a hover pattern, touch support is a bolted-on afterthought.

### 2. One (?) icon per field group, not per option

**Choice**: A single (?) icon next to the label (e.g., "Completion type (?)") that shows all options with descriptions in one popover.

**Why**: Keeps the UI clean. One tap → full reference card. Putting icons inside `<SelectContent>` dropdowns would be visually cluttered and technically awkward (custom rendering inside Radix Select items).

### 3. Reusable HelpPopover component

**Choice**: A standalone `src/components/HelpPopover.tsx` that accepts `items: Array<{ term: string; description: string }>` and renders the (?) icon + popover.

**Why**: The pattern is identical across all four integration points — only the content differs. Keeps form components clean (one-line addition to each label).

**Usage pattern**:
```jsx
<Label className="flex items-center gap-1">
  {t("climb.completionType")}
  <HelpPopover items={[
    { term: t("climb.completionTypes.onsight"), description: t("help.completionTypes.onsight") },
    ...
  ]} />
</Label>
```

### 4. i18n keys under `help.*` namespace

**Choice**: New top-level `help` key in translation files with sub-groups matching existing term groups.

**Why**: Keeps help text separate from UI labels. Structure: `help.completionTypes.onsight`, `help.styles.lead`, `help.sessionTypes.lead`, `help.gradeSystems.french`.

### 5. Include all terms in each popover, not just confusing ones

**Choice**: Each popover lists all terms in its group (e.g., all 5 completion types), even obvious ones like "repeat" and "attempt".

**Why**: Acts as a complete reference card. The one-liner format keeps obvious terms from adding clutter, and completeness avoids the "why is X missing?" question.

### 6. Icon choice: HelpCircle from lucide-react

**Choice**: `HelpCircle` icon (already available — lucide-react is an existing dependency) at a small size (`h-4 w-4`), muted color (`text-muted-foreground`), with hover highlight.

**Why**: Standard (?) affordance. Unobtrusive at muted color. Lucide is already in the project.

## Risks / Trade-offs

- **Label line height change**: Adding an inline icon to `<Label>` could shift vertical alignment slightly. → Mitigation: use `flex items-center gap-1` on the label, test visually. The `h-4` icon matches the label's `text-sm` line height.
- **Popover z-index on mobile**: Popovers might clip behind other elements. → Mitigation: Radix handles z-index and portalling by default.
- **Translation maintenance**: Every new term in the future needs a help description too. → Mitigation: Help text is optional per field — only add (?) where it's useful, not mandatory everywhere.
