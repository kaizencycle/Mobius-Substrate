# Changesets Configuration

Kaizen OS uses [Changesets](https://github.com/changesets/changesets) for version management.

## Usage

### Adding a Changeset

When making changes that require a version bump:

```bash
npm run changeset
```

This will:
1. Prompt for the type of change (major/minor/patch)
2. Ask which packages are affected
3. Generate a changeset file in `.changeset/`

### Creating a Release

```bash
npm run changeset:version  # Updates versions based on changesets
npm run changeset:publish  # Publishes packages (if configured)
```

### GitHub Action

A GitHub Action should be added to automate version bumps on merge to main.

## Example Changeset

```yaml
---
"@civic/ledger-service": patch
"@civic/integrity-units": patch
---

Fixed GI aggregator to use configurable fallback instead of hardcoded value
```

