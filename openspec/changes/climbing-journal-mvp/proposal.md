## Why

There is no lightweight, personal climbing journal that runs entirely in the browser with zero infrastructure. Existing apps are either cloud-dependent, overly complex, or don't understand climbing-specific concepts (grade systems, completion types like onsight/flash/redpoint, session structure). A 48-year-old climber returning to the sport needs a simple tool to log sessions, track individual climbs, and visualize progress through grade pyramids — without signing up for yet another service. Starting as a local-first web app hosted on GitHub Pages, with a clear path to mobile + offline in the future.

## What Changes

This is a greenfield project. We are building:

- **Climber profile** with personal info (birth year, experience, current/goal grades, other activities, language preference PL/EN)
- **Session logging** — date, location, type, duration, energy/satisfaction ratings, free-text notes, with individual climbs nested inside each session
- **Climb entries** — route name, structured grade (multi-system: French, YDS, V-scale, Font), completion type (onsight/flash/redpoint/repeat/attempt), attempts count, perceived difficulty, notes
- **Session history** — browsable list with view/edit, filterable by date range, location, type
- **Grade pyramid** — visual bar chart with predefined time ranges (month/3mo/6mo/year/all-time), filterable by style (lead/boulder/all) and completion type checkboxes
- **Location management** — reusable climbing locations (gym/crag) selectable when logging
- **Data management** — auto-persist SQLite to OPFS/IndexedDB, manual export/import of .sqlite file for backup
- **Internationalization** — Polish as default language, switchable to English

## Capabilities

### New Capabilities

- `climber-profile`: User profile setup and editing — birth year, climbing experience, current and goal grades, other activities, known injuries, locale preference (PL/EN)
- `session-logging`: Create, view, edit, and delete climbing sessions with nested climb entries. Sessions capture date, location, type, duration, energy/satisfaction, and notes. Climbs capture route name, grade, completion type, attempts, perceived difficulty, and notes.
- `session-history`: Browsable, filterable list of past sessions. Filter by date range, location, and session type. View and edit session details.
- `grade-pyramid`: Visual grade pyramid chart showing climb distribution by grade. Predefined time range selector (month, 3 months, 6 months, year, all-time). Filter by style (lead/boulder/all) and completion type checkboxes.
- `location-management`: CRUD for climbing locations (name, type gym/crag, region). Quick-select when logging sessions.
- `data-persistence`: SQLite database running in-browser via sql.js/WASM. Auto-persist to OPFS with IndexedDB fallback. Export database as .sqlite file download. Import database from .sqlite file upload.
- `i18n`: Polish-first internationalization with English as second language. Client-side language switching via react-i18next.

### Modified Capabilities

(none — greenfield project)

## Impact

- **New project** — Vite + React + TypeScript SPA
- **Dependencies** — sql.js (SQLite WASM), react-i18next, Recharts, Tailwind CSS, shadcn/ui, React Router
- **Hosting** — GitHub Pages (static files only, no server)
- **Data** — All data lives in browser storage (OPFS/IndexedDB). No external APIs or databases.
- **Future considerations** — SQLite schema designed to be portable to native mobile SQLite. Export/import enables manual data transfer between platforms.
