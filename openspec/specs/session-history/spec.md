## ADDED Requirements

### Requirement: Display session history as a list
The system SHALL display all past sessions in reverse chronological order (newest first) showing: date (formatted per locale), location name, session type, duration, number of climbs logged, and highest grade climbed in that session.

#### Scenario: View session history
- **WHEN** the user navigates to the session history page
- **THEN** the system SHALL display a list of all sessions ordered by date descending

#### Scenario: Empty history
- **WHEN** the user has no sessions logged
- **THEN** the system SHALL display an empty state with a prompt to log their first session

#### Scenario: Highest grade is determined by grade difficulty
- **WHEN** a session contains multiple climbs with grades
- **THEN** the highest grade SHALL be determined by actual grade difficulty ordering (e.g., 6b+ > 6a in French), not by alphabetical/lexicographic string comparison

#### Scenario: Dates are locale-formatted
- **WHEN** the session history is displayed
- **THEN** session dates SHALL be formatted according to the user's locale preference

### Requirement: View session details
The system SHALL allow the user to view the full details of any session, including all climb entries, notes, and ratings.

#### Scenario: Open session detail
- **WHEN** the user clicks on a session in the history list
- **THEN** the system SHALL display the complete session with all climb entries, energy/satisfaction ratings, and notes

### Requirement: Filter sessions by date range
The system SHALL allow filtering the session history by predefined date ranges: last month, last 3 months, last 6 months, last year, and all time.

#### Scenario: Filter by last 3 months
- **WHEN** the user selects "last 3 months" date range filter
- **THEN** the system SHALL display only sessions from the last 3 months

#### Scenario: Default shows all sessions
- **WHEN** the user opens session history without setting a filter
- **THEN** the system SHALL display all sessions (all time)

### Requirement: Filter sessions by location
The system SHALL allow filtering the session history by location.

#### Scenario: Filter by specific location
- **WHEN** the user selects a location from the filter dropdown
- **THEN** the system SHALL display only sessions at that location

### Requirement: Filter sessions by type
The system SHALL allow filtering the session history by session type (lead, boulder, toprope, mixed).

#### Scenario: Filter by bouldering sessions
- **WHEN** the user selects "boulder" type filter
- **THEN** the system SHALL display only bouldering sessions

### Requirement: Filters are combinable
The system SHALL allow combining multiple filters (date range + location + type) simultaneously.

#### Scenario: Combined filter
- **WHEN** the user selects "last 3 months" AND "boulder" AND a specific location
- **THEN** the system SHALL display only sessions matching ALL active filters
