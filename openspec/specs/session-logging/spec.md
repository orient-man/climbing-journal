## ADDED Requirements

### Requirement: Create a climbing session
The system SHALL allow the user to create a new session with: date, location (optional, selected from saved locations), session type (lead, boulder, toprope, mixed), duration in minutes, energy level before session (1-5 scale), satisfaction after session (1-5 scale), and free-text notes.

#### Scenario: Create session with all fields
- **WHEN** the user fills in all session fields and saves
- **THEN** the system SHALL persist the session to the database and display it in the session history

#### Scenario: Create minimal session
- **WHEN** the user creates a session with only a date and type
- **THEN** the system SHALL accept and persist the session with all other fields as null/empty

### Requirement: Add climbs to a session
The system SHALL allow the user to add zero or more climb entries to a session. Each climb entry SHALL contain: route name (optional), grade (structured: system + value), style (lead, boulder, toprope), completion type (onsight, flash, redpoint, repeat, attempt), number of attempts, perceived difficulty (1-5 scale), and free-text notes.

#### Scenario: Add a climb to an existing session
- **WHEN** the user adds a climb entry within a session
- **THEN** the system SHALL persist the climb linked to that session and display it in the session's climb list

#### Scenario: Session with no climbs
- **WHEN** the user saves a session without adding any individual climbs
- **THEN** the system SHALL accept the session as valid (notes-only session)

#### Scenario: Multiple climbs in one session
- **WHEN** the user adds several climbs to a session
- **THEN** the system SHALL display them in the order they were added and allow reordering

### Requirement: Edit a session
The system SHALL allow the user to edit all fields of an existing session, including adding, modifying, or removing climb entries.

#### Scenario: Edit session details
- **WHEN** the user modifies a session's date, location, or notes
- **THEN** the system SHALL persist the changes

#### Scenario: Edit a climb within a session
- **WHEN** the user modifies a climb's grade or completion type
- **THEN** the system SHALL persist the change to that specific climb entry

#### Scenario: Remove a climb from a session
- **WHEN** the user deletes a climb entry from a session
- **THEN** the system SHALL remove the climb from the database and update the session view

### Requirement: Delete a session
The system SHALL allow the user to delete an entire session, including all its climb entries.

#### Scenario: Delete session with confirmation
- **WHEN** the user requests to delete a session
- **THEN** the system SHALL ask for confirmation before deleting
- **THEN** upon confirmation, the system SHALL remove the session and all associated climbs from the database

### Requirement: Grade input respects climbing style
The system SHALL present appropriate grade systems based on the climb's style. When the user selects a grade system, the grade value SHALL reset to empty, and both the system and value changes SHALL be applied atomically so that no intermediate state is lost.

#### Scenario: Lead climb grade input
- **WHEN** the user selects "lead" or "toprope" as the climb style
- **THEN** the grade selector SHALL offer sport climbing systems (French, YDS)

#### Scenario: Boulder climb grade input
- **WHEN** the user selects "boulder" as the climb style
- **THEN** the grade selector SHALL offer bouldering systems (V-scale, Font)

#### Scenario: Selecting a grade system enables grade value selection
- **WHEN** the user selects a grade system (e.g., French)
- **THEN** the grade value dropdown SHALL become enabled and show grades for that system
- **AND** any previously selected grade value SHALL be cleared

#### Scenario: Changing grade system resets grade value atomically
- **WHEN** the user changes the grade system from one system to another
- **THEN** the system SHALL update both the grade system and reset the grade value in a single state update so that the system selection is not lost
