## ADDED Requirements

### Requirement: Create a climbing location
The system SHALL allow the user to create a named climbing location with: name (required), type (gym or crag), and region (optional free text).

#### Scenario: Add a gym location
- **WHEN** the user creates a location with name "CityBoulder", type "gym"
- **THEN** the system SHALL persist the location and make it available for session logging

#### Scenario: Add a crag with region
- **WHEN** the user creates a location with name "Jura Krakowska", type "crag", region "Małopolska"
- **THEN** the system SHALL persist the location with all fields

### Requirement: Edit a location
The system SHALL allow the user to edit the name, type, and region of an existing location.

#### Scenario: Rename a location
- **WHEN** the user changes a location's name from "CityBoulder" to "City Boulder Kraków"
- **THEN** the system SHALL update the location name and all sessions referencing it SHALL display the new name

### Requirement: Delete a location
The system SHALL allow the user to delete a location that is not referenced by any session.

#### Scenario: Delete unused location
- **WHEN** the user deletes a location that has no sessions linked to it
- **THEN** the system SHALL remove the location from the database

#### Scenario: Prevent deletion of used location
- **WHEN** the user attempts to delete a location that is referenced by one or more sessions
- **THEN** the system SHALL prevent deletion and inform the user that the location is in use

### Requirement: Select location when logging a session
The system SHALL present saved locations as a selectable dropdown/list when creating or editing a session.

#### Scenario: Select from existing locations
- **WHEN** the user is creating a session and clicks the location field
- **THEN** the system SHALL display a list of all saved locations for selection

#### Scenario: Quick-add location during session logging
- **WHEN** the user is logging a session and the desired location doesn't exist
- **THEN** the system SHALL allow creating a new location inline without leaving the session form

### Requirement: List all locations
The system SHALL provide a view listing all saved locations with their type and region.

#### Scenario: View locations list
- **WHEN** the user navigates to the locations management page
- **THEN** the system SHALL display all locations sorted alphabetically by name
