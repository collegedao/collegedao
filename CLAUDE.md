# CLAUDE.md - Development Guide

This guide explains how to run validation scripts and rebuild leaderboards for College DAO.

## Prerequisites

- Node.js 20+
- pnpm package manager

## Installation

```bash
pnpm install
```

## Available Commands

### Format Code
```bash
pnpm format
```
Runs Prettier to format all Markdown and JavaScript files.

### Validate Repository
```bash
pnpm validate
```

Checks that all files meet requirements:
- **Profiles** (`profiles/clubs/*.md`, `profiles/organizations/*.md`, `profiles/donors/*.md`):
  - Required frontmatter: `name`, `slug`, `type`, `region`, `website`
  - Required sections: `# Overview`, `## Wallets`, `## Contributions`, `## Totals`
  - Clubs must include `university` field
- **Contributions** (`contributions/**/*.md`):
  - Required frontmatter: `title`, `date`, `season`, `year`, `entity_type`
  - Must include line matching: `amount: $<number>` (e.g., `amount: $500.00`)
  - Entity slug is automatically derived from the folder path (e.g., `contributions/clubs/example-club/` → slug is `example-club`)
- **Proposals** (`proposals/**/*.md`):
  - Required frontmatter: `title`, `proposer`, `season`, `year`, `category`, `status`
  
Validation will fail with exit code 1 if any requirements aren't met.

### Rebuild Leaderboards
```bash
pnpm rebuild
```

Automatically updates:
1. **Leaderboard files**:
   - `profiles/CLUBS.md` - Rankings of all university clubs by total contributions
   - `profiles/ORGANIZATIONS.md` - Rankings of sponsor organizations
   - `profiles/DONORS.md` - Rankings of individual donors

2. **Profile totals** (in each profile under `## Totals`):
   - `Total contributed (USD): $<sum>`
   - `Last contribution: <YYYY-MM-DD>` or `N/A`

The rebuild script:
- Scans all `contributions/**/*.md` files
- Parses `amount: $<number>` from each contribution
- Groups by `entity_slug` and `entity_type`
- Calculates totals and finds most recent contribution date
- Updates files in-place (idempotent - safe to run multiple times)

## CI/CD Integration

These commands run automatically via GitHub Actions:
- **On Pull Requests**: `pnpm validate` ensures all files meet standards
- **On merge to main**: `pnpm rebuild` updates leaderboards and commits changes

## Troubleshooting

### Validation Errors

If validation fails, the error message will indicate:
- Which file has the issue
- What's missing or incorrect
- Line number for `amount:` formatting issues

Example:
```
ERROR: contributions/clubs/example/2025/event.md missing required amount line
Expected format: amount: $123.45
```

### Rebuild Issues

The rebuild script is designed to be safe:
- Only modifies specific sections (leaderboards and `## Totals`)
- Preserves all other content
- Creates backups before modification

If issues occur:
- Check that contribution files have valid `entity_slug` matching profile slugs
- Ensure `amount:` lines follow exact format: `amount: $123.45`
- Verify date format is `YYYY-MM-DD`

## Development Tips

1. **Test locally before committing**:
   ```bash
   pnpm validate && pnpm rebuild
   ```

2. **Check specific files**:
   ```bash
   # Validate just one file type
   node scripts/validate.mjs --type=contributions
   ```

3. **Dry run rebuild**:
   ```bash
   # See what would change without modifying files
   node scripts/rebuild.mjs --dry-run
   ```

## File Format Examples

### Valid Contribution Amount
```markdown
## Financials

amount: $1500.00
tx: solana: https://solscan.io/tx/abc123
```

### Valid Profile Totals (auto-updated)
```markdown
## Totals

Total contributed (USD): $2500.00
Last contribution: 2025-09-15
```

## Mintlify Documentation

The repository uses Mintlify for documentation. Configuration notes:

### Important Configuration Rules
- **DO NOT** include the CLAUDE.md file in Mintlify navigation
- The CLAUDE.md file is for development reference only and should remain accessible via direct file access
- When updating mint.json, ensure CLAUDE.md is not added to any navigation groups or tabs

### Running Documentation
```bash
# Install Mintlify CLI
pnpm add -g mintlify

# Run documentation development server
pnpm docs:dev

# Build documentation for production
pnpm docs:build
```

## Questions?

Open an issue in the repository for help with validation or rebuild scripts.