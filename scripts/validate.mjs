#!/usr/bin/env node

import { readMarkdownFile, REQUIRED_FRONTMATTER, REQUIRED_SECTIONS, VALID_SEASONS, VALID_ENTITY_TYPES, VALID_PROPOSAL_CATEGORIES, VALID_PROPOSAL_STATUSES, validateDate } from './utils.mjs';
import path from 'path';
import { globby } from 'globby';

let hasErrors = false;
let hasWarnings = false;

function logError(file, message) {
  console.error(`❌ ERROR: ${file}\n   ${message}\n`);
  hasErrors = true;
}

function logWarning(file, message) {
  console.warn(`⚠️  WARNING: ${file}\n   ${message}\n`);
  hasWarnings = true;
}

async function validateProfile(filePath) {
  const { data, content } = await readMarkdownFile(filePath);

  // Derive type from folder path
  const pathParts = filePath.split(path.sep);
  const profilesIndex = pathParts.indexOf('profiles');
  if (profilesIndex < 0) {
    logError(filePath, 'File is not in profiles folder');
    return;
  }

  const folderName = pathParts[profilesIndex + 1];

  // Map plural folder names to singular entity types
  const folderTypeMap = {
    'clubs': 'club',
    'organizations': 'organization',
    'donors': 'donor'
  };

  const type = folderTypeMap[folderName];
  if (!type) {
    logError(filePath, `Invalid profile folder: ${folderName}. Must be one of: clubs, organizations, donors`);
    return;
  }

  // Check required frontmatter
  const required = REQUIRED_FRONTMATTER.profile[type] || REQUIRED_FRONTMATTER.profile.donor;
  for (const field of required) {
    if (!data[field]) {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }

  // Check required sections
  for (const section of REQUIRED_SECTIONS.profile) {
    if (!content.includes(section)) {
      logError(filePath, `Missing required section: ${section}`);
    }
  }

  // Check for contributions link
  if (!content.includes('contributions/')) {
    logWarning(filePath, 'Profile should link to contributions folder');
  }
}

async function validateContribution(filePath) {
  const { data, content } = await readMarkdownFile(filePath);
  
  // Check required frontmatter
  for (const field of REQUIRED_FRONTMATTER.contribution) {
    if (!data[field]) {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }
  
  // Validate date
  if (data.date) {
    // Convert date to string if it's a Date object (gray-matter parses dates)
    const dateStr = data.date instanceof Date ? data.date.toISOString().split('T')[0] : data.date;
    if (!validateDate(dateStr)) {
      logError(filePath, `Invalid date format: ${data.date}. Use YYYY-MM-DD`);
    }
  }
  
  // Validate season
  if (data.season && !VALID_SEASONS.includes(data.season)) {
    logError(filePath, `Invalid season: ${data.season}. Must be one of: ${VALID_SEASONS.join(', ')}`);
  }
  
  // Validate entity type
  if (data.entity_type && !VALID_ENTITY_TYPES.includes(data.entity_type)) {
    logError(filePath, `Invalid entity_type: ${data.entity_type}. Must be one of: ${VALID_ENTITY_TYPES.join(', ')}`);
  }
  
  // Check for amount line
  const amountMatch = content.match(/^amount:\s*\$[\d,]+\.?\d*$/mi);
  if (!amountMatch) {
    logError(filePath, 'Missing required amount line. Expected format: "amount: $123.45"');
  }
  
  // Check required sections
  for (const section of REQUIRED_SECTIONS.contribution) {
    if (!content.includes(section)) {
      logError(filePath, `Missing required section: ${section}`);
    }
  }
  
  // Validate path structure
  const pathParts = filePath.split(path.sep);
  const contributionsIndex = pathParts.indexOf('contributions');
  if (contributionsIndex >= 0) {
    const entityType = pathParts[contributionsIndex + 1];
    const entitySlug = pathParts[contributionsIndex + 2];
    
    // Map plural directory names to singular entity types
    const entityTypeMap = {
      'clubs': 'club',
      'organizations': 'organization', 
      'donors': 'donor'
    };
    const expectedType = entityTypeMap[entityType] || entityType;
    
    if (expectedType !== data.entity_type) {
      logError(filePath, `Path entity type "${entityType}" doesn't match frontmatter "${data.entity_type}"`);
    }
    
    // No need to validate entity_slug - it's derived from path
  }
}

async function validateProposal(filePath) {
  const { data, content } = await readMarkdownFile(filePath);
  
  // Check required frontmatter
  for (const field of REQUIRED_FRONTMATTER.proposal) {
    if (!data[field]) {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }
  
  // Validate season
  if (data.season && !VALID_SEASONS.includes(data.season)) {
    logError(filePath, `Invalid season: ${data.season}. Must be one of: ${VALID_SEASONS.join(', ')}`);
  }
  
  // Validate category
  if (data.category && !VALID_PROPOSAL_CATEGORIES.includes(data.category)) {
    logError(filePath, `Invalid category: ${data.category}. Must be one of: ${VALID_PROPOSAL_CATEGORIES.join(', ')}`);
  }
  
  // Validate status
  if (data.status && !VALID_PROPOSAL_STATUSES.includes(data.status)) {
    logError(filePath, `Invalid status: ${data.status}. Must be one of: ${VALID_PROPOSAL_STATUSES.join(', ')}`);
  }
  
  // Check required sections
  for (const section of REQUIRED_SECTIONS.proposal) {
    if (!content.includes(section)) {
      logError(filePath, `Missing required section: ${section}`);
    }
  }
  
  // Validate sponsors array
  if (data.sponsors && !Array.isArray(data.sponsors)) {
    logError(filePath, 'Sponsors must be an array');
  }
  
  // Budget proposals need amount
  if (data.category === 'budget' && !data.requested_amount_usd) {
    logError(filePath, 'Budget proposals must include requested_amount_usd');
  }
}

async function main() {
  console.log('🔍 Validating College DAO repository...\n');
  
  // Validate profiles
  console.log('📋 Checking profiles...');
  const profileTypes = ['clubs', 'organizations', 'donors'];
  for (const type of profileTypes) {
    const files = await globby(`profiles/${type}/*.mdx`);
    for (const file of files) {
      await validateProfile(file);
    }
  }
  
  // Validate contributions
  console.log('\n💰 Checking contributions...');
  const contributions = await globby('contributions/**/*.mdx', {
    ignore: ['**/overview.mdx']
  });
  for (const file of contributions) {
    await validateContribution(file);
  }
  
  // Validate proposals
  console.log('\n📜 Checking proposals...');
  const proposals = await globby('proposals/**/*.mdx', {
    ignore: ['**/overview.mdx']
  });
  for (const file of proposals) {
    await validateProposal(file);
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error(`\n❌ Validation failed with errors`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`\n✅ Validation passed with warnings`);
  } else {
    console.log(`\n✅ All validation checks passed!`);
  }
}

main().catch(error => {
  console.error('Validation script error:', error);
  process.exit(1);
});