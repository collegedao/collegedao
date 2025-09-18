# College DAO

Welcome to College DAO — a decentralized autonomous organization supporting blockchain innovation across 150+ universities worldwide.

## What is College DAO?

College DAO is a community-driven initiative that connects, funds, and empowers university blockchain clubs and organizations. We provide financial support, resources, and governance participation to help student builders launch the next generation of web3 innovation.

Our mission is to:
- Fund hackathons, workshops, and educational initiatives
- Support travel and conference attendance for student builders
- Foster collaboration between university blockchain communities
- Provide resources and mentorship for student-led projects

## How Governance Works

College DAO operates through a hybrid governance model combining:
- **GitHub**: Draft proposals, track contributions, maintain transparency
- **Realms**: On-chain voting for treasury actions and major decisions
- **Council Model**: One seat per verified university club (no fungible token required)

### Quick Start

1. **Join as a Club**:
   - Create your club profile: `profiles/clubs/<your-club-slug>.md`
   - Add your wallet addresses for each chain
   - Link your contributions folder: `contributions/clubs/<your-club-slug>/`
   - Open a Pull Request
   - (Optional) Create a linked Realms proposal for council admission

2. **Submit a Proposal**:
   - Create: `proposals/<year>/<season>/<proposal-slug>.md`
   - Include required frontmatter and sections
   - Open a Pull Request for community discussion
   - Link to Realms proposal URL when on-chain action needed

3. **Record Contributions**:
   - Document all donations in `contributions/` with required `amount: $<USD>` line
   - We encourage 5-10% after-cost donations from funded events
   - Include transaction links for verification

## Repository Structure

```
├─ profiles/
│  ├─ clubs/           # University club profiles
│  ├─ organizations/   # Sponsor organization profiles  
│  ├─ donors/         # Individual donor profiles
│  ├─ clubs.md        # Auto-generated club leaderboard
│  ├─ organizations.md # Auto-generated org leaderboard
│  └─ donors.md       # Auto-generated donor leaderboard
├─ proposals/          # Funding proposals by year/season
├─ contributions/      # Tracked donations and contributions
├─ documentation/      # Governance and treasury documentation
└─ scripts/            # Validation and leaderboard automation
```

## Documentation

This repository uses [Mintlify](https://mintlify.com) for documentation. To run the documentation site locally:

```bash
# Install dependencies
pnpm install

# Install Mintlify CLI
pnpm add -g mintlify

# Run documentation development server
pnpm docs:dev

# Build documentation for production
pnpm docs:build
```

The documentation will be available at http://localhost:3333

## Quick Links

- [Governance Overview](documentation/governance.md) — Council model, voting, and proposal process
- [Realms Guide](documentation/realms.md) — Creating and linking on-chain proposals
- [Treasury Guide](documentation/treasury.md) — Donation guidelines and wallet addresses
- [Contribution Guidelines](#contribution-culture) — Recording donations

## Contribution Culture

College DAO thrives on a culture of giving back. We encourage all funded clubs and events to contribute 5-10% of their net proceeds back to the DAO treasury. This sustainable model ensures we can continue supporting the next generation of builders.

All contributions are:
- Publicly tracked in `contributions/`
- Automatically tallied in leaderboards
- Recognized in our community

## Getting Started

1. **Explore existing clubs**: Browse the `profiles/clubs/` directory
2. **Review active proposals**: Check `proposals/2025/`
3. **Join the discussion**: Open issues and PRs
4. **Connect on-chain**: Visit our Realms DAO (link TBD)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of conduct
- PR guidelines
- Validation requirements
- Community standards

## License

This repository is open source under the MIT License.