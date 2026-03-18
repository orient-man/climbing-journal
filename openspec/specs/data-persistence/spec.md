## ADDED Requirements

### Requirement: SQLite database runs in the browser via WASM
The system SHALL use sql.js (SQLite compiled to WebAssembly) to run a full SQLite database in the browser. No server-side database SHALL be required.

#### Scenario: Database initialization on first visit
- **WHEN** the user opens the app for the first time
- **THEN** the system SHALL create a new SQLite database in memory, run the schema creation migrations, and persist the database to browser storage

### Requirement: Auto-persist database to browser storage
The system SHALL automatically persist the SQLite database to browser storage after every data mutation (create, update, delete). The primary storage target SHALL be OPFS (Origin Private File System). If OPFS is not available, the system SHALL fall back to IndexedDB.

#### Scenario: Auto-save after adding a session
- **WHEN** the user creates a new session
- **THEN** the system SHALL persist the entire database to OPFS/IndexedDB without user intervention

#### Scenario: OPFS not available
- **WHEN** the browser does not support OPFS
- **THEN** the system SHALL automatically use IndexedDB for persistence and the app SHALL function normally

### Requirement: Load database from browser storage on startup
The system SHALL attempt to load an existing database from browser storage on app startup. If found, it SHALL be loaded into sql.js. If not found, a new empty database SHALL be created.

#### Scenario: Returning user with existing data
- **WHEN** the user opens the app and a persisted database exists in OPFS/IndexedDB
- **THEN** the system SHALL load that database and all previously saved data SHALL be available

#### Scenario: First-time user
- **WHEN** the user opens the app and no persisted database exists
- **THEN** the system SHALL create a fresh database with the current schema

### Requirement: Export database as .sqlite file
The system SHALL allow the user to download the entire database as a .sqlite file.

#### Scenario: Export database
- **WHEN** the user clicks the export/backup button
- **THEN** the system SHALL trigger a browser download of the current database as a file named `climbing-journal-YYYY-MM-DD.sqlite`

### Requirement: Import database from .sqlite file
The system SHALL allow the user to upload a .sqlite file to replace the current database.

#### Scenario: Import valid database
- **WHEN** the user uploads a valid .sqlite file
- **THEN** the system SHALL ask for confirmation (warning: this replaces all current data)
- **THEN** upon confirmation, the system SHALL replace the current database with the imported file, persist it to browser storage, and reload the app state

#### Scenario: Import invalid file
- **WHEN** the user uploads a file that is not a valid SQLite database
- **THEN** the system SHALL display an error message and keep the current database unchanged

### Requirement: Schema versioning and migrations
The system SHALL maintain a schema version in the database. On startup, the system SHALL check the schema version and run any pending migrations sequentially to bring the database to the current version.

#### Scenario: App update with new schema
- **WHEN** the user opens an updated version of the app and the database schema version is older than the app's current version
- **THEN** the system SHALL run all pending migrations in order and update the schema version

#### Scenario: Import older database version
- **WHEN** the user imports a .sqlite file with an older schema version
- **THEN** the system SHALL run migrations to upgrade it to the current version after import

### Requirement: Backup reminder
The system SHALL track the date of the last database export. If more than 14 days have passed since the last export, the system SHALL display a non-blocking reminder suggesting the user export a backup. The reminder SHALL be visible in the UI, not only implemented at the data layer.

#### Scenario: Backup reminder after 14 days
- **WHEN** the user opens the app and the last export was more than 14 days ago
- **THEN** the system SHALL display a dismissible notification on the dashboard reminding them to export a backup

#### Scenario: No reminder after recent export
- **WHEN** the user exported the database within the last 14 days
- **THEN** the system SHALL NOT display the backup reminder

#### Scenario: Dismiss backup reminder
- **WHEN** the user dismisses the backup reminder
- **THEN** the system SHALL not show the reminder again for at least 1 day

#### Scenario: Reminder links to export
- **WHEN** the backup reminder is displayed
- **THEN** it SHALL provide a way to navigate to the export functionality
