## ADDED Requirements

### Requirement: Profile stores climber identity and preferences
The system SHALL store a single climber profile with the following fields: display name, birth year, climbing since (year), current lead grade, current boulder grade, goal grade, other activities (list of strings), known injuries (list of strings), and locale preference (pl or en).

#### Scenario: First-time profile creation
- **WHEN** the user opens the app for the first time
- **THEN** the system SHALL present a profile setup screen before allowing access to other features

#### Scenario: Profile fields are optional except locale
- **WHEN** the user is filling in the profile
- **THEN** only the locale preference SHALL be required; all other fields MAY be left empty

### Requirement: Grade fields use structured grade format
The system SHALL store current lead grade, current boulder grade, and goal grade as structured data containing a grading system (french, yds, v-scale, font) and a grade value string.

#### Scenario: User selects grade with system
- **WHEN** the user sets their current lead grade
- **THEN** the system SHALL present a grade system selector (French, YDS) and a grade value selector appropriate to that system

#### Scenario: Boulder grade uses boulder systems
- **WHEN** the user sets their current boulder grade
- **THEN** the system SHALL present boulder-specific grade systems (V-scale, Font) and corresponding grade values

### Requirement: Profile is editable
The system SHALL allow the user to edit all profile fields at any time from a settings or profile page.

#### Scenario: Edit profile
- **WHEN** the user navigates to the profile/settings page and modifies a field
- **THEN** the system SHALL persist the change immediately to the database

### Requirement: Locale preference controls app language
The system SHALL use the profile's locale preference to determine the display language of the entire UI.

#### Scenario: Switch language
- **WHEN** the user changes locale from "pl" to "en" in the profile
- **THEN** all UI labels, buttons, and static text SHALL switch to English without page reload
