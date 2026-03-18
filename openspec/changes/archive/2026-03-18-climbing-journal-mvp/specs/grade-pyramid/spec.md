## ADDED Requirements

### Requirement: Display grade pyramid as horizontal bar chart
The system SHALL display a grade pyramid visualization showing the count of climbs per grade as horizontal bars, sorted by grade from lowest (bottom) to highest (top).

#### Scenario: View grade pyramid
- **WHEN** the user navigates to the grade pyramid view
- **THEN** the system SHALL display a horizontal bar chart with grades on the Y-axis and climb counts on the X-axis

#### Scenario: Empty pyramid
- **WHEN** the user has no climbs logged
- **THEN** the system SHALL display an empty state indicating no data is available

### Requirement: Filter grade pyramid by time range
The system SHALL allow filtering the grade pyramid by predefined time ranges: last month, last 3 months, last 6 months, last year, and all time.

#### Scenario: Filter by last 6 months
- **WHEN** the user selects "last 6 months" time range
- **THEN** the grade pyramid SHALL display only climbs from the last 6 months

#### Scenario: Default time range
- **WHEN** the user opens the grade pyramid without selecting a time range
- **THEN** the system SHALL default to "all time"

### Requirement: Filter grade pyramid by climbing style
The system SHALL allow filtering the grade pyramid by climbing style: lead, boulder, or all.

#### Scenario: Filter by boulder only
- **WHEN** the user selects "boulder" style filter
- **THEN** the grade pyramid SHALL display only boulder climbs with bouldering grades

#### Scenario: Show all styles
- **WHEN** the user selects "all" style filter
- **THEN** the grade pyramid SHALL display climbs of all styles (note: lead and boulder grades are on different scales and SHALL be shown in separate sections or clearly distinguished)

### Requirement: Filter grade pyramid by completion type
The system SHALL allow filtering the grade pyramid by completion type via checkboxes: onsight, flash, redpoint, repeat, attempt. Multiple checkboxes MAY be active simultaneously.

#### Scenario: Show only sends (onsight + flash + redpoint)
- **WHEN** the user checks onsight, flash, and redpoint checkboxes and unchecks repeat and attempt
- **THEN** the grade pyramid SHALL display only climbs with those completion types

#### Scenario: Default completion filter
- **WHEN** the user opens the grade pyramid without changing completion filters
- **THEN** all completion types SHALL be checked by default

### Requirement: Grade pyramid counts are based on unique sends
The system SHALL count each climb entry individually for the pyramid. If a user logged the same route twice in different sessions, both entries SHALL be counted.

#### Scenario: Duplicate route in different sessions
- **WHEN** the user logged "Route X" at 6a as redpoint in two different sessions
- **THEN** the grade pyramid SHALL show 2 counts for grade 6a (assuming filters match)

### Requirement: Grades are sorted correctly within each system
The system SHALL sort grades in the pyramid according to the correct ordering for each grade system (e.g., French: 5a < 5b < 5c < 6a < 6a+ < 6b < 6b+ < 6c < 6c+ < 7a...).

#### Scenario: French grade ordering
- **WHEN** the pyramid displays French grades
- **THEN** grades SHALL be ordered from lowest to highest following the French sport climbing grade scale
