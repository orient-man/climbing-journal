## 1. Project Scaffolding

- [ ] 1.1 Initialize Vite + React + TypeScript project
- [ ] 1.2 Configure Tailwind CSS and install shadcn/ui (button, input, select, dialog, card, toast components)
- [ ] 1.3 Set up React Router with hash-based routing and base layout (nav, main content area)
- [ ] 1.4 Set up react-i18next with Polish and English translation files (initial skeleton with common labels)
- [ ] 1.5 Configure GitHub Pages deployment (vite config base path, gh-pages or GitHub Actions workflow)

## 2. Database Layer

- [ ] 2.1 Integrate sql.js — load WASM, initialize empty database, create DB context/provider for React
- [ ] 2.2 Implement schema v1 migration — create tables: profile, sessions, climbs, locations, schema_version
- [ ] 2.3 Implement migration runner — check schema_version on startup, run pending migrations sequentially
- [ ] 2.4 Implement OPFS persistence — save database to OPFS after every mutation, load on startup
- [ ] 2.5 Implement IndexedDB fallback — detect OPFS support, fall back to IndexedDB when unavailable
- [ ] 2.6 Implement export — download current database as `climbing-journal-YYYY-MM-DD.sqlite`
- [ ] 2.7 Implement import — upload .sqlite file, validate it's a valid SQLite DB, confirm replacement, load and persist
- [ ] 2.8 Implement backup reminder — track last export date, show dismissible notification if >14 days

## 3. Grade System

- [ ] 3.1 Define grade ordering tables for all 4 systems (French, YDS, V-scale, Font) as static data
- [ ] 3.2 Create grade utility functions — comparison, sorting, display formatting
- [ ] 3.3 Create GradeSelector component — grade system dropdown + grade value dropdown, filtered by climbing style (sport systems for lead/toprope, boulder systems for boulder)

## 4. Climber Profile

- [ ] 4.1 Create profile database operations (CRUD for single profile row)
- [ ] 4.2 Create profile setup screen — shown on first visit when no profile exists
- [ ] 4.3 Create profile edit page — accessible from settings/nav, editable fields with save
- [ ] 4.4 Wire locale preference to react-i18next — changing locale in profile switches app language

## 5. Location Management

- [ ] 5.1 Create location database operations (CRUD, list all, check if referenced by sessions)
- [ ] 5.2 Create locations management page — list all locations, add new, edit, delete (with protection for in-use locations)
- [ ] 5.3 Create LocationSelector component — dropdown for session form, with inline quick-add option

## 6. Session Logging

- [ ] 6.1 Create session database operations (create, read, update, delete session with associated climbs)
- [ ] 6.2 Create session form page — date, location selector, type, duration, energy (1-5), satisfaction (1-5), notes
- [ ] 6.3 Create climb entry sub-form — route name, grade selector, style, completion type, attempts, perceived difficulty, notes
- [ ] 6.4 Wire climb entries into session form — add/remove/reorder climbs within session, save all together
- [ ] 6.5 Create session detail view — display full session with all climb entries
- [ ] 6.6 Create session edit mode — reuse session form pre-filled with existing data, save updates

## 7. Session History

- [ ] 7.1 Create session list query — fetch sessions with summary data (climb count, highest grade), ordered by date desc
- [ ] 7.2 Create session history page — list view with session cards showing date, location, type, duration, climb count, highest grade
- [ ] 7.3 Add date range filter — predefined choices (month, 3 months, 6 months, year, all time)
- [ ] 7.4 Add location filter — dropdown populated from saved locations
- [ ] 7.5 Add session type filter — checkboxes or dropdown for lead/boulder/toprope/mixed
- [ ] 7.6 Wire delete session — confirmation dialog, delete from database, refresh list

## 8. Grade Pyramid

- [ ] 8.1 Create grade pyramid data query — aggregate climb counts by grade, with filters for time range, style, completion type
- [ ] 8.2 Create grade pyramid chart component using Recharts — horizontal bar chart, grades on Y-axis, counts on X-axis
- [ ] 8.3 Add time range selector — predefined choices (month, 3 months, 6 months, year, all time), default all time
- [ ] 8.4 Add style filter — lead / boulder / all (when "all", separate lead and boulder grades into sections)
- [ ] 8.5 Add completion type checkboxes — onsight, flash, redpoint, repeat, attempt (all checked by default)

## 9. Internationalization Polish-up

- [ ] 9.1 Complete Polish translation file — all UI labels, buttons, headings, placeholders, error messages, empty states, climbing terms
- [ ] 9.2 Complete English translation file — same coverage as Polish
- [ ] 9.3 Implement locale-aware date formatting (DD.MM.YYYY for PL, MMM DD, YYYY for EN)
- [ ] 9.4 Add language toggle to nav/settings — visible way to switch PL ↔ EN

## 10. Final Integration & Polish

- [ ] 10.1 Create app navigation — sidebar or top nav with links to: dashboard/home, log session, history, grade pyramid, locations, profile/settings
- [ ] 10.2 Create home/dashboard page — quick stats (total sessions, total climbs, current max grade), recent sessions, link to log new session
- [ ] 10.3 Add loading state for WASM initialization — show spinner/skeleton while sql.js loads
- [ ] 10.4 Add empty states for all list views (no sessions, no locations, no climbs in pyramid)
- [ ] 10.5 Test full flow — create profile → add location → log session with climbs → view history → view pyramid → export → import
- [ ] 10.6 Verify GitHub Pages deployment works end-to-end
