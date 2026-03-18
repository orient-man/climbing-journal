## MODIFIED Requirements

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
