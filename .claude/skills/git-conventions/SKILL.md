---
name: git-conventions
description: Git commit message conventions and branch naming standards. Use when creating commits, branches, or preparing code for version control. Triggers on commit creation, branch creation, or when user asks about git workflow conventions.
---

# Git Conventions

## Branch Naming

Format: `<type>/<description>`

- **type**: `feature`, `bugfix`, `hotfix`, `refactor`, `chore`, `docs`
- **description**: Concise kebab-case description

Examples:
- `refactor/modernize-and-fix`
- `feature/custom-link-colors`
- `bugfix/circular-link-overlap`
- `chore/update-dependencies`

## Commit Message Format

```
<type>(<scope>): <subject>

- <bullet point 1>
- <bullet point 2>
- <bullet point 3>
```

### Rules

1. **Type**: Use conventional commit types (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `build`)
2. **Scope**: Use the area of the project being modified:
   - `core` — changes to `src/sankeyCircular.js` (the main algorithm)
   - `align` — changes to `src/align.js` (alignment functions)
   - `build` — changes to `rollup.config.js`, `package.json` build config, `.babelrc`
   - `deps` — dependency updates in `package.json`
   - `test` — test files
   - `example` — changes to `example/`
   - `docs` — README, WORKPLAN, documentation
   - For changes spanning multiple areas, separate with comma: `(core, build)`
3. **Subject**: Imperative mood, lowercase, no period at end
4. **Body**: Only bullet points, no prose paragraphs
5. **No Co-Authored-By** line

### Examples

```
refactor(build): remove babel and upgrade rollup to v4

- Remove all babel-related dependencies and config files
- Upgrade rollup from 0.59 to 4.x
- Update plugins to @rollup/plugin-* namespace
```

```
fix(core): replace loose equality with strict equality

- Replace 56 instances of == with ===
- Fix for loop initialization syntax in 3 locations
- Clean up commented-out code blocks
```

```
chore(deps): remove deprecated d3-collection

- Replace d3-collection map() with native Map
- Replace nest() with d3.group() from d3-array v3
- Update d3-array to ^3.0.0 and d3-shape to ^3.0.0
```

```
test(core): add unit tests for sankey layout

- Add vitest setup and configuration
- Add tests for basic layout computation
- Add tests for circular link detection
- Add edge case tests for empty graphs and self-links
```

```
feat(core, example): add input validation

- Validate graph structure before layout computation
- Throw descriptive errors for invalid input
- Update example to handle validation errors
```
