## MODIFIED Requirements

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
