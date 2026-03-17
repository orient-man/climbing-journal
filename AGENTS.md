# AGENTS.md

Instructions for AI coding agents working in this repository.

## Workflow: OpenSpec

This project uses [OpenSpec](https://github.com/openspec-dev/openspec) for structured change management. All non-trivial changes must go through the OpenSpec workflow.

### Commands

| Command | Purpose |
|---------|---------|
| `/opsx-propose` | Propose a new change (creates proposal, design, and tasks) |
| `/opsx-apply` | Implement tasks from an existing change |
| `/opsx-explore` | Think through ideas before or during a change |
| `/opsx-archive` | Archive a completed change |

### Rules

1. **Propose before implementing.** Do not start coding non-trivial features or refactors without first creating an OpenSpec change via `/opsx-propose`.
2. **Follow the artifacts.** Read `proposal.md`, `design.md`, and `tasks.md` before writing code. Implementation must stay aligned with the approved design.
3. **Mark tasks as you go.** Update `tasks.md` checkboxes (`- [ ]` to `- [x]`) immediately after completing each task.
4. **Archive when done.** Once all tasks are complete, use `/opsx-archive` to finalize the change.

## Commits: Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation-only changes |
| `style` | Formatting, missing semicolons, etc. (no code logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Changes to build system or dependencies |
| `ci` | CI/CD configuration changes |
| `chore` | Maintenance tasks that don't modify src or test files |

### Rules

1. **Use lowercase** for the type and description.
2. **Keep the subject line under 72 characters.**
3. **Use imperative mood** in the description (e.g., "add feature" not "added feature").
4. **Scope is optional** but encouraged when the change targets a specific module or area (e.g., `feat(auth): add login flow`).
5. **Breaking changes** must include `BREAKING CHANGE:` in the footer or `!` after the type/scope (e.g., `feat!: remove legacy API`).
6. **One logical change per commit.** Do not bundle unrelated changes.
