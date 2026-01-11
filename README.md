# CollegeDAO Student Ecosystem Fund

College DAO is the largest, most trusted university student network in blockchain at 120+ universities worldwide. Since founding in 2022, we've provided $1.2M+ in economic value to students through hackathons, conferences, and education initiatives.

See our [introduction documentation](https://docs.google.com/document/d/14nYbCWzRFe50crkisVQ_UoMhtpZNtGcC1Wo8QeG6rjg) for more details.

The CollegeDAO Ecosystem Fund was created to collectively fund university blockchain club hackathons, events, and travel sponsorships through decentralized governance, allowing you to bring bigger events to your campus, send members to top conferences, and accelerate your community without financial barriers.

## How Governance Works

College DAO operates through a hybrid governance model combining:
- **GitHub**: Track donations, maintain transparency, host documentation
- **Realms**: On-chain voting for treasury actions and major decisions
- **Council Model**: One seat per verified university club (no fungible token required)

### Quick Start

1. **Join as a Club**:
   - [Register through our onboarding form](https://tally.so/r/lbeyGp)
   - Secure sponsorship from an existing council member
   - Pass a council admission vote (66% supermajority)
   - Receive council member role from CollegeDAO core team

2. **Submit a Proposal**:
   - Create: `proposals/<year>/<season>/<proposal-slug>.mdx`
   - Include required frontmatter: title, proposer, date, requested_amount_usd
   - Submit for community review (minimum 3 days)
   - On-chain vote via Realms (5 days voting period)

3. **Make a Donation** (Voluntary):
   - Donations to the Ecosystem Fund are entirely voluntary
   - Record donations in `donations/` with transaction details
   - Credit a club to unlock matching funds (up to $3,000/quarter per club)

## Repository Structure

```
├─ clubs/              # University club profiles
├─ donations/          # Voluntary donation records
│  ├─ clubs/           # Donations credited to clubs
│  ├─ donors/          # Individual donor records
│  └─ organizations/   # Organization/sponsor records
├─ proposals/          # Funding proposals by year/season
├─ documentation/      # Governance and treasury documentation
├─ logo/               # Brand assets
└─ scripts/            # Validation and leaderboard automation
```

## Documentation

This repository uses [Mintlify](https://mintlify.com) for documentation. To run the documentation site locally:

```bash
# Install dependencies
pnpm install

# Run documentation development server
pnpm docs:dev

# Build documentation for production
pnpm docs:build
```

The documentation will be available at http://localhost:3333

## Quick Links

- [Get Started](documentation/get-started.mdx) — Join as a club, submit proposals, participate
- [Governance Overview](documentation/governance.mdx) — Council model, voting, and proposal process
- [Treasury Guide](documentation/treasury.mdx) — Donation guidelines, matching program, wallet addresses

## Ecosystem Fund

College DAO maintains an Ecosystem Fund to support student initiatives:

- **Project Funding** (50%) — Event and initiative funding
- **Matching Pool** (20%) — Match donations sourced by clubs (1:1 up to $3,000/quarter)
- **Emergency Reserves** (20%) — Buffer for unexpected needs
- **Operations** (10%) — Infrastructure and tooling

All donations are:
- Entirely voluntary
- Publicly tracked in `donations/`
- Recognized on community leaderboards
- Eligible for matching when credited to a club

## Getting Started

1. **Explore existing clubs**: Browse the `clubs/` directory
2. **Review active proposals**: Check `proposals/2026/`
3. **Join the discussion**: Open issues and PRs
4. **Connect on-chain**: Visit our [Realms DAO](https://realms.today)

## License

This repository is open source under the MIT License.
