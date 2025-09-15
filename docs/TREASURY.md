# Treasury Guide

This guide covers College DAO treasury management, donation guidelines, and how to properly record contributions.

## Donation Guidelines

### Contribution Culture

College DAO operates on a sustainable give-back model:
- **Recommended**: 5-10% of net proceeds from funded events
- **Calculation**: After covering direct costs and expenses
- **Timing**: Within 30 days of event completion
- **Recognition**: All contributions tracked publicly

### Why Contribute?

- **Sustainability**: Ensures funding for future student builders
- **Community**: Builds a culture of mutual support
- **Transparency**: Demonstrates responsible fund management
- **Impact**: Your contribution directly helps other university clubs

## Treasury Addresses

College DAO maintains multi-chain treasury addresses for maximum flexibility:

| Chain | Address | Explorer |
|-------|---------|----------|
| Solana | `[TBD - DAO Treasury Address]` | [Solscan](https://solscan.io) |
| Ethereum | `[TBD - DAO Treasury Address]` | [Etherscan](https://etherscan.io) |
| Polygon | `[TBD - DAO Treasury Address]` | [Polygonscan](https://polygonscan.com) |
| Arbitrum | `[TBD - DAO Treasury Address]` | [Arbiscan](https://arbiscan.io) |
| Base | `[TBD - DAO Treasury Address]` | [Basescan](https://basescan.org) |

### Preferred Chains
1. **Solana** - Primary SVM treasury
2. **Ethereum** - Primary EVM treasury 
3. Coming soon

## Recording Donations

### Step 1: Create Contribution File

Create a new file in your entity's contribution folder:
```
contributions/
├─ clubs/<your-slug>/<year>/<event-name>.md
├─ organizations/<your-slug>/<year>/<contribution-name>.md
└─ donors/<your-slug>/<year>/<donation-name>.md
```

### Step 2: File Format

Use this template:

```markdown
---
title: Welcome Week Hackathon
date: 2025-09-15
season: fall
year: 2025
entity_type: club
tags: [hackathon, education, community]
---

# Summary

Brief description of the event/contribution and its impact.

## Evidence

- Event photos: [Link to gallery]
- Participant count: 120 students
- Winners announcement: [Link]
- Social media recap: [Link]

## Financials

Total revenue: $5,000
Total expenses: $4,200
Net proceeds: $800

amount: $80.00

Donation calculation: 10% of net proceeds

## Transaction Details

tx: solana: https://solscan.io/tx/[transaction-hash]
tx: ethereum: https://etherscan.io/tx/[transaction-hash]

## Notes

Additional context, thank you notes, or future plans.
```

### Step 3: Critical Requirements

The contribution MUST include:
1. **Exact amount format**: `amount: $80.00` on its own line
2. **Valid date**: `YYYY-MM-DD` format
3. **Path matches entity**: The folder path determines the entity (e.g., `contributions/clubs/example-club/` means entity slug is `example-club`)

### Step 4: Transaction Verification

Include transaction links when available:
```
tx: solana: https://solscan.io/tx/abc123...
tx: ethereum: https://etherscan.io/tx/0x123...
```

Format: `tx: <chain>: <explorer-url>`

### Step 5: Submit PR

1. Create pull request with your contribution file
2. Use PR template checklist
3. Tag `treasury-verification` if requesting verification
4. Maintainers will review within 48 hours

## Verification Process

### Optional Verification

While all contributions are publicly tracked, you can request official verification:

1. **Tag PR**: Add `treasury:` label
2. **Provide Evidence**: Include transaction links
3. **Wait for Review**: Treasury team validates on-chain
4. **Receive Confirmation**: ✅ added to PR once verified

### What We Verify

- Transaction exists on-chain
- Amount matches declared amount
- Recipient is official treasury address
- Timing aligns with event date

## Contribution Examples

### Hackathon Donation
```markdown
## Financials

Sponsorship received: $10,000
Venue cost: $2,000
Food & beverages: $3,000
Prizes: $3,500
Supplies: $500
Net proceeds: $1,000

amount: $100.00

Donation: 10% of net proceeds to support future events
```

### Workshop Series
```markdown
## Financials

Registration fees (50 students × $20): $1,000
Instructor payment: $500
Materials: $200
Platform fees: $100
Net proceeds: $200

amount: $20.00

Contribution: 10% back to DAO treasury
```

### Direct Donation
```markdown
## Financials

Personal contribution to support College DAO mission.

amount: $500.00

tx: solana: https://solscan.io/tx/4abc...
```

## Tax Considerations

> **Disclaimer**: This is not tax advice. Consult professionals for your situation.

- Keep records of all contributions
- Donations may be tax-deductible (jurisdiction dependent)
- College DAO can provide contribution summaries upon request
- Consider consulting tax professionals for large donations

## Treasury Management

### Multi-Sig Control
- Threshold: [X] of [Y] signers required
- Signers represent diverse universities
- Quarterly rotation of signing responsibilities
- All transactions recorded on-chain

### Fund Allocation
- 70% - Event and project funding
- 20% - Emergency reserves
- 10% - Operations and infrastructure

### Transparency Reports
- Monthly treasury snapshots
- Quarterly allocation summaries
- Annual impact reports
- All available in `reports/` directory

## Get Involved

### Become a Treasury Contributor
- Donate directly to support student builders
- Contribute after successful funded events
- Sponsor specific initiatives or universities

### Join Treasury Committee
- Help manage DAO funds responsibly
- Review funding proposals
- Create transparency reports
- Design sustainable treasury strategies

## Questions?

- **Technical Issues**: Open GitHub issue
- **Verification**: Tag PR with `treasury-verification`
- **General Questions**: [Discord #treasury channel]
- **Large Donations**: Contact [treasury@collegedao.io]

Remember: Every contribution, no matter the size, helps support the next generation of blockchain builders across universities worldwide!