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

#### Clubs (`clubs/*.mdx`)
- Required frontmatter: `name`, `university`, `region`
- Required sections: `# About`, `## Wallets`, `## Donations`, `## Totals`
- Should link to `donations/clubs/<slug>/`

#### Donations (`donations/{clubs|donors|organizations}/{slug}/{year}/*.mdx`)
- Required frontmatter: `title`, `date`, `amount`, `token`, `chain`, `tx_hash`
- Optional frontmatter: `donor_name`, `anonymous`, `message`
- Entity type is inferred from folder path (e.g., `donations/clubs/` → club)
- The `amount` field in frontmatter is the source of truth for automation

#### Proposals (`proposals/{year}/{season}/*.mdx`)
- Required frontmatter: `title`, `proposer`, `date`, `requested_amount_usd`
- Status and season are tracked via badges in body, not frontmatter
- Year and season are derived from folder path

Validation will fail with exit code 1 if any requirements aren't met.

### Rebuild Leaderboards
```bash
pnpm rebuild
```

Automatically updates:

1. **Leaderboard file**:
   - `clubs/_LEADERBOARD.mdx` - Rankings of all university clubs by total donations

2. **Profile totals** (in each club profile under `## Totals`):
   - `Total contributed (USD): $<sum>`
   - `Last contribution: <YYYY-MM-DD>` or `N/A`

The rebuild script:
- Scans all `donations/**/*.mdx` files
- Parses `amount` from frontmatter (or legacy `amount: $X.XX` body line as fallback)
- Groups by entity type and slug (derived from path)
- Calculates totals and finds most recent donation date
- Updates files in-place (idempotent - safe to run multiple times)

## Folder Structure

```
collegedao/
├── clubs/                    # Club profiles
│   ├── _LEADERBOARD.mdx      # Auto-generated rankings
│   ├── berkeley-blockchain.mdx
│   └── ...
├── donations/                # Donation records
│   ├── _template.mdx         # Template for new donations
│   ├── overview.mdx          # Documentation
│   ├── clubs/                # Club donations
│   │   └── {slug}/{year}/{YYYY-MM-DD}-{description}.mdx
│   ├── donors/               # Individual donor donations
│   │   └── {slug}/{year}/{YYYY-MM-DD}-{description}.mdx
│   └── organizations/        # Organization/sponsor donations
│       └── {slug}/{year}/{YYYY-MM-DD}-{description}.mdx
├── proposals/                # Funding proposals
│   ├── overview.mdx          # Documentation
│   └── {year}/{season}/{proposal-slug}.mdx
├── documentation/            # Mintlify docs
│   ├── overview.mdx
│   ├── get-started.mdx
│   ├── governance.mdx
│   └── treasury.mdx
└── scripts/                  # Automation scripts
    ├── utils.mjs
    ├── validate.mjs
    └── rebuild.mjs
```

## CI/CD Integration

These commands run automatically via GitHub Actions:
- **On Pull Requests**: `pnpm validate` ensures all files meet standards
- **On merge to main**: `pnpm rebuild` updates leaderboards and commits changes

## File Format Examples

### Club Profile
```yaml
---
name: Blockchain at Berkeley
university: UC Berkeley
region: North America
---

# About
Club description...

## Socials
Social badges...

## Wallets
- Solana: `address`
- Ethereum: `address`

## Donations
[View donations →](../../donations/clubs/berkeley-blockchain/)

## Totals
Total contributed (USD): $00.00
Last contribution: N/A

## Contacts
Leadership info...
```

### Donation Record
```yaml
---
title: Annual Hackathon Support
date: 2025-09-15
amount: 500.00
token: USDC
chain: solana
tx_hash: abc123...
donor_name: Jane Smith
anonymous: false
message: Keep building!
---

## Donation Details

| Field | Value |
|-------|-------|
| **Amount** | 500.00 USDC |
| **Date** | 2025-09-15 |
| **From** | Jane Smith |
| **Network** | Solana |

> "Keep building!"

**[View Transaction ↗](https://solscan.io/tx/abc123...)**
```

### Proposal
```yaml
---
title: Conference Travel Sponsorship
proposer: berkeley-blockchain
date: 2025-09-01
requested_amount_usd: 15000
---

![Status](https://img.shields.io/badge/Status:-Draft-yellow)
![Season](https://img.shields.io/badge/Season:-Fall%202025-purple)

## 1. Event Overview
...

## 2. Budget & Funding Sources
...

## 3. Timeline
...

## 4. Success Metrics & Proof
...
```

## Troubleshooting

### Validation Errors

If validation fails, the error message will indicate:
- Which file has the issue
- What's missing or incorrect

Example:
```
❌ ERROR: clubs/example-club.mdx
   Missing required frontmatter field: university
```

### Rebuild Issues

The rebuild script is designed to be safe:
- Only modifies specific sections (leaderboards and `## Totals`)
- Preserves all other content

If issues occur:
- Check that donation files are in the correct path structure
- Ensure `amount` is a valid number in frontmatter
- Verify date format is `YYYY-MM-DD`

## Mintlify Documentation

The repository uses Mintlify for documentation. Configuration notes:

### Important Configuration Rules
- **DO NOT** include the CLAUDE.md file in Mintlify navigation
- The CLAUDE.md file is for development reference only

### Running Documentation
```bash
# Run documentation development server
pnpm docs:dev

# Build documentation for production
pnpm docs:build
```

## Questions?

Open an issue in the repository for help with validation or rebuild scripts.