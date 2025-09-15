#!/usr/bin/env node

import { readMarkdownFile, writeMarkdownFile, formatCurrency, parseAmount, getAllFiles } from './utils.mjs';
import path from 'path';
import { globby } from 'globby';
import fs from 'fs/promises';

// Track all entities and their contributions
const entities = {
  club: new Map(),
  organization: new Map(),
  donor: new Map()
};

async function processContribution(filePath) {
  try {
    const { data, content } = await readMarkdownFile(filePath);
    
    if (!data.entity_type || !data.date) {
      console.warn(`⚠️  Skipping ${filePath}: Missing required frontmatter`);
      return;
    }
    
    // Derive entity slug from file path
    const pathParts = filePath.split(path.sep);
    const contributionsIndex = pathParts.indexOf('contributions');
    if (contributionsIndex < 0 || contributionsIndex + 2 >= pathParts.length) {
      console.warn(`⚠️  Skipping ${filePath}: Invalid path structure`);
      return;
    }
    const entitySlug = pathParts[contributionsIndex + 2];
    
    // Extract amount from content
    const amountMatch = content.match(/^amount:\s*\$?([\d,]+\.?\d*)$/mi);
    if (!amountMatch) {
      console.warn(`⚠️  Skipping ${filePath}: No amount found`);
      return;
    }
    
    const amount = parseAmount(amountMatch[1]);
    if (amount === null) {
      console.warn(`⚠️  Skipping ${filePath}: Invalid amount format`);
      return;
    }
    
    // Get or create entity record
    const entityMap = entities[data.entity_type];
    if (!entityMap) {
      console.warn(`⚠️  Skipping ${filePath}: Invalid entity type ${data.entity_type}`);
      return;
    }
    
    if (!entityMap.has(entitySlug)) {
      entityMap.set(entitySlug, {
        total: 0,
        lastDate: null,
        contributions: []
      });
    }
    
    const entity = entityMap.get(entitySlug);
    entity.total += amount;
    entity.contributions.push({
      amount,
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date,
      title: data.title
    });
    
    // Update last contribution date
    const contributionDate = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;
    if (!entity.lastDate || contributionDate > entity.lastDate) {
      entity.lastDate = contributionDate;
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

async function updateProfile(profilePath, entityData) {
  try {
    const { data, content } = await readMarkdownFile(profilePath);
    
    // Update the totals section
    const totalLine = `Total contributed (USD): ${formatCurrency(entityData.total)}`;
    const lastLine = `Last contribution: ${entityData.lastDate || 'N/A'}`;
    
    // Replace the two lines under ## Totals
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

async function generateLeaderboard(entityType, entities) {
  // Sort by total contributions descending
  const sorted = Array.from(entities.entries())
    .map(([slug, data]) => ({ slug, ...data }))
    .sort((a, b) => b.total - a.total);
  
  const entityTypeCapitalized = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const title = entityType === 'club' ? 'Clubs' : 
                entityType === 'organization' ? 'Organizations' : 'Donors';
  
  let content = `# ${title} Leaderboard

*Auto-generated from contribution data. Last updated: ${new Date().toISOString().split('T')[0]}*

| Rank | Name | Total Contributed (USD) | Last Contribution | Profile |
|------|------|------------------------|-------------------|---------|
`;
  
  for (let i = 0; i < sorted.length; i++) {
    const entity = sorted[i];
    const profilePath = `profiles/${entityType}s/${entity.slug}.md`;
    
    // Try to get the entity name from profile
    let name = entity.slug;
    try {
      const { data } = await readMarkdownFile(profilePath);
      name = data.name || entity.slug;
    } catch (error) {
      // Profile doesn't exist yet
    }
    
    const formattedDate = entity.lastDate || 'N/A';
    content += `| ${i + 1} | ${name} | ${formatCurrency(entity.total)} | ${formattedDate} | [View](${entityType}s/${entity.slug}.md) |\n`;
  }
  
  if (sorted.length === 0) {
    content += `| - | *No contributions yet* | - | - | - |\n`;
  }
  
  content += `
## Summary

- **Total ${title}**: ${sorted.length}
- **Total Contributed**: ${formatCurrency(sorted.reduce((sum, e) => sum + e.total, 0))}
- **Average Contribution**: ${sorted.length > 0 ? formatCurrency(sorted.reduce((sum, e) => sum + e.total, 0) / sorted.length) : '$0.00'}

## How to Contribute

1. Create your ${entityType} profile in \`profiles/${entityType}s/\`
2. Record contributions in \`contributions/${entityType}s/<your-slug>/<year>/\`
3. Include the required \`amount: $<USD>\` line
4. Submit a pull request

See [CLAUDE.md](../CLAUDE.md) for detailed instructions.`;
  
  const filename = `profiles/${title.toUpperCase()}.md`;
  await fs.writeFile(filename, content);
  console.log(`✅ Generated ${filename}`);
}

async function main() {
  console.log('🔄 Rebuilding College DAO leaderboards...\n');
  
  // Process all contributions
  console.log('📊 Processing contributions...');
  const contributions = await globby('contributions/**/*.md');
  
  for (const file of contributions) {
    await processContribution(file);
  }
  
  // Show summary
  console.log('\n📈 Contribution Summary:');
  for (const [type, entityMap] of Object.entries(entities)) {
    const total = Array.from(entityMap.values()).reduce((sum, e) => sum + e.total, 0);
    console.log(`   ${type}s: ${entityMap.size} entities, ${formatCurrency(total)} total`);
  }
  
  // Update profile totals
  console.log('\n📝 Updating profile totals...');
  for (const [type, entityMap] of Object.entries(entities)) {
    for (const [slug, data] of entityMap) {
      const profilePath = `profiles/${type}s/${slug}.md`;
      try {
        await updateProfile(profilePath, data);
      } catch (error) {
        console.warn(`⚠️  Profile not found: ${profilePath}`);
      }
    }
  }
  
  // Generate leaderboards
  console.log('\n🏆 Generating leaderboards...');
  await generateLeaderboard('club', entities.club);
  await generateLeaderboard('organization', entities.organization);
  await generateLeaderboard('donor', entities.donor);
  
  console.log('\n✨ Rebuild complete!');
}

main().catch(error => {
  console.error('Rebuild script error:', error);
  process.exit(1);
});