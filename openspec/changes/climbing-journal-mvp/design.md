## Context

This is a greenfield project — a climbing journal web app for tracking climbing sessions and visualizing progress. There is no existing codebase. The app runs entirely in the browser as a static SPA hosted on GitHub Pages with no backend server. All data is stored locally in SQLite via WASM. The primary user is a Polish-speaking climber, with English as a secondary language.

Key constraints:
- **No server** — GitHub Pages serves static files only
- **Browser-only data** — SQLite via sql.js compiled to WASM, persisted to OPFS/IndexedDB
- **Future mobile** — the SQLite schema must be portable to native mobile SQLite
- **Single user for MVP** — no auth, no multi-user

## Goals / Non-Goals

**Goals:**
- Ship a usable climbing journal that runs from GitHub Pages with zero infrastructure
- Nail the domain model for climbing (grades, completion types, sessions, climbs)
- Make data safe via export/import and auto-persistence
- Support Polish and English from day one
- Keep the architecture simple enough for a single developer to maintain
- Keep the data layer correct through automated tests — grade ordering, DB operations, migrations, and aggregation queries must be test-driven

**Non-Goals:**
- Server-side rendering or API routes
- User authentication or multi-user support
- Training planner or AI advisor features
- Social features (follow, share, compare)
- Project tracking (multi-session route tracking)
- Hangboard or non-climbing workout logging
- Mobile app (but architecture should not block it)

## Decisions

### 1. Vite + React SPA over Next.js
**Decision**: Use Vite with React and TypeScript as a pure client-side SPA.

**Rationale**: Next.js requires a server runtime (even static export has limitations with dynamic routes). GitHub Pages serves only static files. Vite produces a clean static bundle, has fast DX, and imposes no server assumptions.

**Alternatives considered**:
- Next.js static export — still opinionated toward server patterns, overkill for a client-only app
- SvelteKit — smaller ecosystem, would limit contributor pool
- Plain HTML/JS — too low-level, no component model

### 2. sql.js (SQLite WASM) for data storage
**Decision**: Use sql.js to run SQLite in the browser via WebAssembly. Persist the database to Origin Private File System (OPFS) as primary storage, with IndexedDB as fallback for browsers without OPFS support.

**Rationale**: SQLite gives us a real relational database with proper schema, migrations, and query power — all in the browser. The same schema can be reused on native mobile SQLite later. Export/import of the raw .sqlite file is trivial.

**Alternatives considered**:
- IndexedDB directly — no relational model, awkward query patterns, hard to export
- localStorage — 5-10MB limit, string-only, no structure
- PouchDB/CouchDB — adds sync complexity we don't need yet
- Dexie.js (IndexedDB wrapper) — better API but still not relational, no portability to mobile SQLite

### 3. Structured grade representation
**Decision**: Store grades as structured data `{ system: string, value: string }` with a known ordering per system. Supported systems: French (sport), YDS (sport), V-scale (boulder), Font (boulder).

**Rationale**: Climbing grades are not simple strings — they have ordering (6b+ > 6a), multiple systems, and different systems for different climbing styles. Structured representation enables sorting, filtering, grade pyramid building, and future cross-system conversion.

### 4. Hash routing for GitHub Pages compatibility
**Decision**: Use React Router with hash-based routing (`/#/sessions/123`).

**Rationale**: GitHub Pages doesn't support server-side URL rewriting. Hash routing works everywhere without workarounds. The alternative (404.html redirect trick) is fragile and adds complexity. URLs are slightly less clean but the app is a personal tool, not an SEO-critical public site.

### 5. react-i18next for internationalization
**Decision**: Use react-i18next with JSON translation files for Polish (default) and English.

**Rationale**: Battle-tested, well-documented, supports namespaced translations, pluralization, and interpolation. Works purely client-side. Lightweight enough for two languages.

### 6. shadcn/ui + Tailwind for UI
**Decision**: Use Tailwind CSS for styling with shadcn/ui as a component library (copy-paste, not npm dependency).

**Rationale**: shadcn/ui gives well-designed, accessible components that we own (no version lock-in). Tailwind keeps styling co-located and consistent. Both are widely adopted with strong community support.

### 7. Recharts for grade pyramid visualization
**Decision**: Use Recharts for the grade pyramid bar chart and any future progress visualizations.

**Rationale**: React-native charting library, declarative API, good customization. Lighter than D3 for our needs. Horizontal bar chart maps naturally to grade pyramid visualization.

### 8. Session → Climb hierarchy as core data model
**Decision**: Sessions are the top-level journal entry. Each session contains zero or more climb entries. Sessions capture context (date, location, energy, conditions). Climbs capture individual route data (grade, completion, attempts).

**Rationale**: This matches how climbers think — "I had a session at the gym on Tuesday" containing "I tried route X three times and sent route Y." Some sessions might have no individual climbs logged (just notes), and that's valid.

### 9. Database schema versioning
**Decision**: Include a `schema_version` table in SQLite. On app load, check version and run migrations if needed. Migrations are sequential numbered scripts.

**Rationale**: The schema will evolve as features are added. Browser SQLite doesn't have built-in migration tooling, so we need a simple version-check-and-migrate pattern. This also helps when importing an older .sqlite backup.

### 10. Pragmatic TDD for data and logic layers
**Decision**: Use test-driven development for the data and logic layer — grade system, database CRUD operations, migration runner, and aggregation queries. UI components are not required to have automated tests. Use Vitest as the test runner.

**Rationale**: The data layer is where bugs are most damaging (data loss, incorrect grade pyramids, broken migrations) and hardest to catch through manual testing. Grade comparison has subtle ordering rules across 4 systems. Aggregation queries have combinatorial filter interactions. These are pure-logic units with well-defined inputs and outputs — ideal TDD candidates. Writing tests first forces clear API design before implementation. UI components, in contrast, are better verified through manual testing and the end-to-end integration flow.

**Scope**:
- **Test-first**: Grade ordering/comparison/sorting utilities, database CRUD operations (profile, sessions, climbs, locations), migration runner (version check, sequential execution, upgrade-on-import), grade pyramid aggregation queries (all filter combinations)
- **Test runner**: Vitest (pairs with Vite, supports ESM and TypeScript natively, fast watch mode)
- **DB in tests**: sql.js runs in Node.js — same WASM engine as the browser, no mocking needed. Tests create an in-memory database, run migrations, and assert against real SQL.
- **Not tested**: React components, form wiring, navigation, i18n configuration, OPFS/IndexedDB persistence (browser-specific APIs)

**Alternatives considered**:
- Strict TDD everywhere including UI components — too slow for a solo MVP, produces brittle tests coupled to rendering implementation
- Test-after only — loses the design benefits of writing tests first, tends to get skipped under time pressure
- No automated tests — unacceptable for the data layer where bugs mean silent data corruption or loss

## Risks / Trade-offs

**[Browser storage eviction]** → Browsers can clear OPFS/IndexedDB under storage pressure (low disk, incognito mode). → **Mitigation**: Prominent export/backup feature. Consider periodic reminder to export. Never rely solely on browser storage for irreplaceable data.

**[sql.js WASM bundle size]** → sql.js WASM binary is ~1MB. Adds to initial load. → **Mitigation**: Lazy-load the WASM file. Show a loading state while initializing. Cache aggressively via service worker in the future.

**[OPFS browser support]** → OPFS is not available in all browsers (missing in older Safari, Firefox on some platforms). → **Mitigation**: IndexedDB fallback. Detect OPFS support at runtime and use the best available option.

**[No backup reminder]** → Users may forget to export, then lose data when clearing browser. → **Mitigation**: Track last export date, show gentle reminder if > 2 weeks since last export.

**[Grade system complexity]** → Supporting 4 grade systems adds complexity to sorting, display, and input. → **Mitigation**: Start with French as default (matching the primary user's context). Other systems are supported but French gets the most polish. Grade ordering tables are static data, not algorithmic.

**[Single-browser lock-in]** → Data lives in one browser on one device. No sync. → **Mitigation**: Export/import .sqlite file. This is acceptable for MVP. Sync is a future concern.

**[No UI-level test coverage]** → UI components and interactions are not covered by automated tests. Bugs in form wiring, navigation, or rendering are caught only during manual testing. → **Mitigation**: The full integration flow (task 10.5) exercises the critical path end-to-end. UI tests can be added later if the project grows.
