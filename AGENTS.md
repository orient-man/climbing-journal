# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project Overview

Climbing journal SPA — browser-only, no backend. Vite + React + TypeScript, Tailwind CSS v3 + shadcn/ui, sql.js (SQLite WASM), react-i18next (PL/EN), Recharts, React Router (hash-based). Hosted on GitHub Pages.

## Build / Lint / Test Commands

```bash
npm run build          # TypeScript check (tsc -b) + Vite production build
npm run dev            # Start dev server (default port 5173)
npm run lint           # ESLint (typescript-eslint + react-hooks + react-refresh)
npm test               # Run all tests once (vitest run)
npm run test:watch     # Watch mode (vitest)

# Run a single test file:
npx vitest run src/db/operations/profile.test.ts

# Run tests matching a name pattern:
npx vitest run -t "creates profile"
```

The build command runs `tsc -b` first — all TypeScript errors must be resolved before Vite bundling starts. Always run `npm run build` to verify after changes.

## TypeScript Configuration

- **Strict mode** enabled: `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **`verbatimModuleSyntax: true`** — use `import type { X }` for type-only imports
- **Path alias**: `@/*` maps to `./src/*` — use this for all cross-directory imports
- **Target**: ES2023, JSX: react-jsx

## Code Style

### Imports

Order (no blank line separators between groups):
1. React (`import { useState, useEffect } from "react"`)
2. Third-party libraries (`react-i18next`, `react-router-dom`, `recharts`, `lucide-react`)
3. Local `@/` imports — UI primitives (`@/components/ui/*`)
4. Local `@/` imports — app modules (`@/db/*`, `@/grades/*`, `@/lib/*`, `@/components/*`, `@/pages/*`)
5. Relative imports (`./sibling`) — only for same-directory references

Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`):
```typescript
import type { Database } from "sql.js";
import { createLocation, type Location } from "@/db/operations/locations";
```

### Exports

- **Default exports**: React components only (`export default function ComponentName()`)
- **Named exports**: everything else — DB operations, utilities, types, interfaces, constants, hooks

### Components

- Always use **function declarations**, never arrow functions or `React.FC`:
  ```typescript
  export default function ProfileForm({ initial, onSubmit }: ProfileFormProps) {
  ```
- Props are typed via an **interface defined above the component**, destructured in the signature
- Props interfaces are NOT exported unless their types are needed by other modules

### Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| Component files | `PascalCase.tsx` | `ProfileForm.tsx`, `AppShell.tsx` |
| Page files | `PascalCase` + `Page` suffix | `HistoryPage.tsx`, `PyramidPage.tsx` |
| DB operation files | `lowercase.ts` (singular noun) | `profile.ts`, `sessions.ts` |
| Test files | Co-located, `.test.ts` suffix | `profile.test.ts`, `utils.test.ts` |
| Utility files | `lowercase.ts` | `utils.ts`, `tables.ts`, `date.ts` |
| Components | PascalCase | `LocationSelector`, `ClimbEntryForm` |
| Hooks | `use` prefix, camelCase | `useDb`, `useDbRequired` |
| DB functions | verb-first camelCase | `getProfile`, `createSession`, `listLocations`, `isLocationInUse` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleDelete`, `handleSave` |
| Constants | `UPPER_SNAKE_CASE` | `FRENCH_GRADES`, `SPORT_SYSTEMS`, `EMPTY_CLIMB` |
| DB column names / interfaces | `snake_case` (mirrors SQLite) | `display_name`, `grade_system`, `location_id` |
| Types / Interfaces | PascalCase | `Profile`, `SessionInput`, `ClimbFormData`, `GradeSystem` |
| Props interfaces | PascalCase + `Props` | `ProfileFormProps`, `GradeSelectorProps` |

### Types

- Prefer `interface` for all data shapes and props
- Use `type` only for union types / aliases (`type GradeSystem = "french" | "yds" | ...`)
- Co-locate interfaces with their operations (e.g., `Profile` interface in `profile.ts`)
- Form data uses all-string fields (`ProfileFormData`); conversion to DB types happens in submit handlers

### State Management

- No external state library. React hooks only (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Database access via `useDb()` context hook — returns `{ db, isLoading, error, persist }`
- Read pattern: call DB operations synchronously during render (`const sessions = listSessions(db, filters)`)
- Write pattern: mutate → persist → force refresh:
  ```typescript
  deleteSession(db, id);
  await persist();
  forceRefresh();
  ```
- Force-refresh trick: `const [, setRefresh] = useState(0); const forceRefresh = useCallback(() => setRefresh(n => n + 1), []);`

### Error Handling

- DB provider catches initialization errors and exposes via `error` state; `AppShell` renders error UI
- DB operations do NOT use try/catch — they throw on failure, return `null` for not-found
- Components use early-return guards: `if (!db) return null;`
- User-facing errors via toast: `toast({ title: t("location.inUse"), variant: "destructive" })`
- Persistence layer uses `try/catch` with `return null` for graceful degradation (OPFS/IndexedDB)

## File Organization

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root (DbProvider + HashRouter + AppShell)
├── index.css                   # Tailwind directives + CSS variables
├── components/                 # Reusable UI components
│   ├── layout/                 #   AppLayout, AppNav
│   ├── ui/                     #   shadcn/ui primitives (generated, not hand-written)
│   └── *.tsx                   #   Feature components (ProfileForm, GradeSelector, etc.)
├── pages/                      # Route-level page components (flat, no nesting)
├── db/                         # Database layer
│   ├── provider.tsx            #   React context (useDb, DbProvider)
│   ├── init.ts                 #   sql.js WASM initialization
│   ├── persistence.ts          #   OPFS / IndexedDB storage
│   ├── export-import.ts        #   File download/upload + backup reminders
│   ├── migrations/             #   Schema versioning (runner.ts, v1.ts + tests)
│   └── operations/             #   CRUD per entity (profile, sessions, locations, pyramid + tests)
├── grades/                     # Grade domain logic (pure, no React)
│   ├── tables.ts               #   Static grade data + types
│   └── utils.ts                #   Comparison, sorting, formatting
├── lib/                        # General utilities (cn(), formatDate)
├── i18n/                       # i18next config + pl.json + en.json
└── test/                       # Test infrastructure (setup, db-helper)
```

Tests are co-located with source files. Domain logic (`grades/`, `db/operations/`) is pure — no React dependencies.

## Testing Approach

- **TDD for data/logic layer**: grade utils, DB CRUD, migrations, pyramid queries
- **No automated tests for UI components** — verified manually
- Tests use in-memory SQLite via `createTestDb()` from `src/test/db-helper.ts`
- Test structure: `describe` per module → `beforeEach` creates fresh DB + runs migrations → `afterEach` closes DB
- Currently **75 tests across 8 test files**

## i18n

- Polish (`pl`) is the default language, English (`en`) is secondary
- All user-visible text must use `t("key")` from `useTranslation()`
- Translation keys use dot notation: `session.types.lead`, `climb.completionTypes.onsight`
- Both `pl.json` and `en.json` must be updated together for any new UI text

## Workflow: OpenSpec

Non-trivial changes use [OpenSpec](https://github.com/openspec-dev/openspec). Commands: `/opsx-propose`, `/opsx-apply`, `/opsx-explore`, `/opsx-archive`. Propose before implementing. Mark tasks as you go. Archive when done.

## Commits: Conventional Commits

Format: `<type>[optional scope]: <description>`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Lowercase, imperative mood, under 72 chars. One logical change per commit.
