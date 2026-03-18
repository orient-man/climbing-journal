## ADDED Requirements

### Requirement: App supports Polish and English languages
The system SHALL support two languages: Polish (pl) and English (en). Polish SHALL be the default language.

#### Scenario: Default language is Polish
- **WHEN** the user opens the app for the first time
- **THEN** all UI text SHALL be displayed in Polish

### Requirement: All UI text is translatable
All user-facing text in the application — labels, buttons, headings, placeholders, error messages, empty states, and notifications — SHALL be loaded from translation files, not hardcoded.

#### Scenario: No hardcoded strings
- **WHEN** any UI screen is rendered
- **THEN** all visible text SHALL come from the i18n translation system

### Requirement: Language switching without reload
The system SHALL allow the user to switch between Polish and English without a full page reload. The language preference SHALL be stored in the climber profile.

#### Scenario: Switch from Polish to English
- **WHEN** the user changes the language setting to English
- **THEN** all UI text SHALL immediately update to English without page reload
- **THEN** the preference SHALL be persisted in the database

### Requirement: Climbing-specific terms use domain vocabulary
Translation files SHALL use correct climbing terminology in both languages. This includes: completion types (onsight, flash, redpoint), session types (lead, boulder, toprope), grade system names, and climbing-specific UI labels.

#### Scenario: Polish climbing terms
- **WHEN** the app is displayed in Polish
- **THEN** completion types SHALL use terms like "onsight", "flash", "redpoint", "powtórzenie", "próba" (note: onsight, flash, redpoint are used as-is in Polish climbing culture)

#### Scenario: English climbing terms
- **WHEN** the app is displayed in English
- **THEN** completion types SHALL use "onsight", "flash", "redpoint", "repeat", "attempt"

### Requirement: Date and number formatting follows locale
The system SHALL format dates and numbers according to the selected locale.

#### Scenario: Polish date format
- **WHEN** the app is in Polish
- **THEN** dates SHALL be displayed in DD.MM.YYYY format (e.g., 17.03.2026)

#### Scenario: English date format
- **WHEN** the app is in English
- **THEN** dates SHALL be displayed in MMM DD, YYYY format (e.g., Mar 17, 2026)
