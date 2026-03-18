## MODIFIED Requirements

### Requirement: Climbing-specific terms use domain vocabulary
Translation files SHALL use correct climbing terminology in both languages. This includes: completion types (onsight, flash, redpoint), session types (lead, boulder, toprope), grade system names, and climbing-specific UI labels. Additionally, translation files SHALL include one-liner help descriptions for each term under a `help.*` namespace.

#### Scenario: Polish climbing terms
- **WHEN** the app is displayed in Polish
- **THEN** completion types SHALL use terms like "onsight", "flash", "redpoint", "powtórzenie", "próba" (note: onsight, flash, redpoint are used as-is in Polish climbing culture)

#### Scenario: English climbing terms
- **WHEN** the app is displayed in English
- **THEN** completion types SHALL use "onsight", "flash", "redpoint", "repeat", "attempt"

#### Scenario: English help descriptions exist for all terminology groups
- **WHEN** the app is in English
- **THEN** translation keys under `help.completionTypes.*`, `help.styles.*`, `help.sessionTypes.*`, and `help.gradeSystems.*` SHALL each provide a one-liner description

#### Scenario: Polish help descriptions exist for all terminology groups
- **WHEN** the app is in Polish
- **THEN** translation keys under `help.completionTypes.*`, `help.styles.*`, `help.sessionTypes.*`, and `help.gradeSystems.*` SHALL each provide a one-liner description in Polish
