## MODIFIED Requirements

### Requirement: Date and number formatting follows locale
The system SHALL format dates and numbers according to the selected locale on ALL pages that display dates, including session history, session detail, and dashboard.

#### Scenario: Polish date format
- **WHEN** the app is in Polish
- **THEN** dates SHALL be displayed in DD.MM.YYYY format (e.g., 17.03.2026) on every page

#### Scenario: English date format
- **WHEN** the app is in English
- **THEN** dates SHALL be displayed in MMM DD, YYYY format (e.g., Mar 17, 2026) on every page

#### Scenario: History page date formatting
- **WHEN** the user views the session history list
- **THEN** session dates SHALL be formatted according to the current locale, not displayed as raw YYYY-MM-DD

#### Scenario: Session detail date formatting
- **WHEN** the user views a session detail page
- **THEN** the session date SHALL be formatted according to the current locale, not displayed as raw YYYY-MM-DD

### Requirement: All UI text is translatable
All user-facing text in the application — labels, buttons, headings, placeholders, error messages, empty states, notifications, unit labels, and chart titles — SHALL be loaded from translation files, not hardcoded.

#### Scenario: No hardcoded strings
- **WHEN** any UI screen is rendered
- **THEN** all visible text SHALL come from the i18n translation system

#### Scenario: Duration units are translated
- **WHEN** session duration is displayed
- **THEN** the unit label (e.g., "min") SHALL come from the translation system

#### Scenario: Chart titles are translated
- **WHEN** the grade pyramid displays section titles for climbing styles
- **THEN** those titles SHALL come from the translation system, not hardcoded strings

#### Scenario: Grade labels are translated
- **WHEN** the highest grade is shown in the session history
- **THEN** the label prefix SHALL come from the translation system
