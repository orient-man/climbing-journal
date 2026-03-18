## ADDED Requirements

### Requirement: Form labels with terminology groups display a help icon

Form fields whose options contain climbing-specific terminology SHALL display a (?) icon inline with the label text. The icon SHALL be visually unobtrusive (muted color, small size) and clearly indicate interactivity.

#### Scenario: Completion type label has help icon
- **WHEN** the user views the climb entry form
- **THEN** the "Completion type" label SHALL display a (?) icon after the label text

#### Scenario: Climb style label has help icon
- **WHEN** the user views the climb entry form
- **THEN** the "Style" label SHALL display a (?) icon after the label text

#### Scenario: Session type label has help icon
- **WHEN** the user views the session form
- **THEN** the "Session type" label SHALL display a (?) icon after the label text

#### Scenario: Grade system has help icon
- **WHEN** the user views any form with a grade selector
- **THEN** the parent label for the grade selector SHALL display a (?) icon after the label text

### Requirement: Tapping the help icon opens a popover with term definitions

Tapping the (?) icon SHALL open a popover listing all terms in that field's option group, each with a one-liner description. The popover SHALL dismiss when the user taps outside of it.

#### Scenario: Completion type popover content
- **WHEN** the user taps the (?) icon next to "Completion type"
- **THEN** a popover SHALL appear listing all completion types (onsight, flash, redpoint, repeat, attempt) with a brief description for each

#### Scenario: Climb style popover content
- **WHEN** the user taps the (?) icon next to "Style"
- **THEN** a popover SHALL appear listing all climb styles (lead, boulder, toprope) with a brief description for each

#### Scenario: Session type popover content
- **WHEN** the user taps the (?) icon next to "Session type"
- **THEN** a popover SHALL appear listing all session types (lead, boulder, toprope, mixed) with a brief description for each

#### Scenario: Grade system popover content
- **WHEN** the user taps the (?) icon next to the grade label
- **THEN** a popover SHALL appear listing all grade systems (French, YDS, V-scale, Font) with a brief description for each

#### Scenario: Popover dismissal
- **WHEN** the popover is open and the user taps outside of it
- **THEN** the popover SHALL close

### Requirement: Help popovers work on mobile devices

The help mechanism SHALL be tap-triggered, not hover-triggered. It SHALL work reliably on touch devices without requiring hover capability.

#### Scenario: Mobile tap interaction
- **WHEN** the user taps the (?) icon on a touch device
- **THEN** the popover SHALL open, displaying term definitions

### Requirement: Help popovers are not shown in display contexts

The (?) help icons SHALL only appear on form labels where users select values. Read-only displays of climbing terms (e.g., session detail page, pyramid filter labels) SHALL NOT include help icons.

#### Scenario: Session detail page has no help icons
- **WHEN** the user views a session detail page showing climb style and completion type
- **THEN** no (?) icons SHALL be present

#### Scenario: Pyramid page filters have no help icons
- **WHEN** the user views the pyramid page with its filter controls
- **THEN** no (?) icons SHALL be present on the filter labels
