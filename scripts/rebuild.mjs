#!/usr/bin/env node

import { readMarkdownFile, writeMarkdownFile, formatCurrency, parseAmount, toDateString } from './utils.mjs';
import path from 'path';
import { globby } from 'globby';
import fs from 'fs/promises';

// Track all entities and their donations
const entities = {
  club: new Map(),
  organization: new Map(),
  donor: new Map(),
};

// =============================================================================
// PROCESS DONATIONS
// =============================================================================
// Path: donations/{type}s/{slug}/{year}/{file}.mdx
// Uses frontmatter `amount` field (not body line)
// =============================================================================

async function processDonation(filePath) {
  try {
    const { data, content } = await readMarkdownFile(filePath);

    // Validate required fields
    if (!data.date) {
      console.warn(`⚠️  Skipping ${filePath}: Missing required frontmatter (date)`);
      return;
    }

    // Derive entity type and slug from file path
    const pathParts = filePath.split(path.sep);
    const donationsIndex = pathParts.indexOf('donations');
    if (donationsIndex < 0 || donationsIndex + 2 >= pathParts.length) {
      console.warn(`⚠️  Skipping ${filePath}: Invalid path structure`);
      return;
    }

    const entityTypeFolder = pathParts[donationsIndex + 1]; // 'clubs', 'donors', or 'organizations'
    const entityType = entityTypeFolder.replace(/s$/, ''); // Remove trailing 's'
    const entitySlug = pathParts[donationsIndex + 2];

    // Get amount from frontmatter (primary) or fallback to body line (legacy)
    let amount = null;

    if (data.amount !== undefined) {
      amount = parseAmount(data.amount);
    }

    // Legacy fallback: parse amount: $X.XX from body
    if (amount === null) {
      const amountMatch = content.match(/^amount:\s*\$?([\d,]+\.?\d*)$/im);
      if (amountMatch) {
        amount = parseAmount(amountMatch[1]);
        console.warn(`⚠️  ${filePath}: Using legacy body amount format. Consider moving to frontmatter.`);
      }
    }

    if (amount === null || amount <= 0) {
      console.warn(`⚠️  Skipping ${filePath}: No valid amount found`);
      return;
    }

    // Get or create entity record
    const entityMap = entities[entityType];
    if (!entityMap) {
      console.warn(`⚠️  Skipping ${filePath}: Invalid entity type "${entityType}"`);
      return;
    }

    if (!entityMap.has(entitySlug)) {
      entityMap.set(entitySlug, {
        total: 0,
        lastDate: null,
        donations: [],
      });
    }

    const entity = entityMap.get(entitySlug);
    entity.total += amount;

    const donationDate = toDateString(data.date);
    entity.donations.push({
      amount,
      date: donationDate,
      title: data.title || path.basename(filePath, '.mdx'),
    });

    // Update last donation date
    if (!entity.lastDate || donationDate > entity.lastDate) {
      entity.lastDate = donationDate;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// =============================================================================
// UPDATE PROFILE TOTALS
// =============================================================================
// Updates ## Totals section in club profiles
// Path: clubs/{slug}.mdx
// =============================================================================

async function updateProfile(profilePath, entityData) {
  try {
    const { data, content } = await readMarkdownFile(profilePath);

    const totalLine = `Total contributed (USD): ${formatCurrency(entityData.total)}`;
    const lastLine = `Last contribution: ${entityData.lastDate || 'N/A'}`;

    // Replace the totals section content
    const updatedContent = content.replace(
      /## Totals\n\nTotal contributed \(USD\): \$[\d,]+\.?\d*\nLast contribution: .*/,
      `## Totals\n\n${totalLine}\n${lastLine}`
    );

    await writeMarkdownFile(profilePath, data, updatedContent);
    console.log(`✅ Updated ${profilePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${profilePath}:`, error.message);
  }
}

// =============================================================================
// GENERATE LEADERBOARD
// =============================================================================
// Generates clubs/_LEADERBOARD.mdx (not profiles/CLUBS.mdx)
// =============================================================================

async function generateLeaderboard(entityType, entityMap) {
  // Sort by total donations descending
  const sorted = Array.from(entityMap.entries())
    .map(([slug, data]) => ({ slug, ...data }))
    .sort((a, b) => b.total - a.total);

  const title = entityType === 'club' ? 'Clubs' : entityType === 'organization' ? 'Organizations' : 'Donors';

  let content = `---
title: ${title} Leaderboard
---

# ${title} Leaderboard

*Auto-generated from donation data. Last updated: ${new Date().toISOString().split('T')[0]}*

| Rank | Name | Total Contributed (USD) | Last Contribution | Profile |
|------|------|------------------------|-------------------|---------|
`;

  for (let i = 0; i < sorted.length; i++) {
    const entity = sorted[i];

    // Determine profile path based on entity type
    let profilePath;
    if (entityType === 'club') {
      profilePath = `clubs/${entity.slug}.mdx`;
    } else if (entityType === 'organization') {
      profilePath = `organizations/${entity.slug}.mdx`;
    } else {
      profilePath = `donors/${entity.slug}.mdx`;
    }

    // Try to get the entity name from profile
    let name = entity.slug;
    try {
      const { data } = await readMarkdownFile(profilePath);
      name = data.name || entity.slug;
    } catch (error) {
      // Profile doesn't exist yet - use slug
    }

    const formattedDate = entity.lastDate || 'N/A';
    content += `| ${i + 1} | ${name} | ${formatCurrency(entity.total)} | ${formattedDate} | [View](${entity.slug}.mdx) |\n`;
  }

  if (sorted.length === 0) {
    content += `| - | *No donations yet* | - | - | - |\n`;
  }

  const totalContributed = sorted.reduce((sum, e) => sum + e.total, 0);
  const avgContribution = sorted.length > 0 ? totalContributed / sorted.length : 0;

  content += `
## Summary

- **Total ${title}**: ${sorted.length}
- **Total Contributed**: ${formatCurrency(totalContributed)}
- **Average Contribution**: ${formatCurrency(avgContribution)}

## How to Contribute

1. Create your ${entityType} profile in \`${entityType === 'club' ? 'clubs' : entityType + 's'}/\`
2. Record donations in \`donations/${entityType === 'club' ? 'clubs' : entityType + 's'}/<your-slug>/<year>/\`
3. Use the donation template: \`donations/_template.mdx\`
4. Submit a pull request

See [CLAUDE.md](../CLAUDE.md) for detailed instructions.
`;

  // Write to appropriate location
  let filename;
  if (entityType === 'club') {
    filename = 'clubs/_LEADERBOARD.mdx';
  } else if (entityType === 'organization') {
    filename = 'organizations/_LEADERBOARD.mdx';
  } else {
    filename = 'donors/_LEADERBOARD.mdx';
  }

  await fs.writeFile(filename, content);
  console.log(`✅ Generated ${filename}`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🔄 Rebuilding College DAO leaderboards...\n');

  // Process all donations
  console.log('📊 Processing donations...');
  const donations = await globby('donations/**/*.mdx', {
    ignore: ['**/overview.mdx', '**/_template.mdx'],
  });

  for (const file of donations) {
    await processDonation(file);
  }

  // Show summary
  console.log('\n📈 Donation Summary:');
  for (const [type, entityMap] of Object.entries(entities)) {
    const total = Array.from(entityMap.values()).reduce((sum, e) => sum + e.total, 0);
    console.log(`   ${type}s: ${entityMap.size} entities, ${formatCurrency(total)} total`);
  }

  // Update club profile totals
  console.log('\n📝 Updating profile totals...');
  for (const [type, entityMap] of Object.entries(entities)) {
    for (const [slug, data] of entityMap) {
      let profilePath;
      if (type === 'club') {
        profilePath = `clubs/${slug}.mdx`;
      } else if (type === 'organization') {
        profilePath = `organizations/${slug}.mdx`;
      } else {
        profilePath = `donors/${slug}.mdx`;
      }

      try {
        await fs.access(profilePath);
        await updateProfile(profilePath, data);
      } catch (error) {
        console.warn(`⚠️  Profile not found: ${profilePath}`);
      }
    }
  }

  // Generate leaderboards (only for types that have data)
  console.log('\n🏆 Generating leaderboards...');

  if (entities.club.size > 0) {
    await generateLeaderboard('club', entities.club);
  } else {
    console.log('   No club donations to generate leaderboard');
  }

  // Future: Generate org/donor leaderboards when those folders exist
  // if (entities.organization.size > 0) {
  //   await generateLeaderboard('organization', entities.organization);
  // }
  // if (entities.donor.size > 0) {
  //   await generateLeaderboard('donor', entities.donor);
  // }

  console.log('\n✨ Rebuild complete!');
}

main().catch((error) => {
  console.error('Rebuild script error:', error);
  process.exit(1);
});
