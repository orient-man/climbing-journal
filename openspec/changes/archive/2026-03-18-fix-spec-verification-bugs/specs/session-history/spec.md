## MODIFIED Requirements

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
