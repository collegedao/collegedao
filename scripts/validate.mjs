#!/usr/bin/env node

import {
  readMarkdownFile,
  REQUIRED_FRONTMATTER,
  REQUIRED_SECTIONS,
  VALID_TOKENS,
  VALID_CHAINS,
  VALID_ENTITY_TYPES,
  VALID_SEASONS,
  validateDate,
  toDateString,
} from './utils.mjs';
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

// =============================================================================
// CLUB VALIDATION
// =============================================================================
// Path: clubs/*.mdx
// Frontmatter: name, university, region
// Sections: # About, ## Wallets, ## Donations, ## Totals
// =============================================================================

async function validateClub(filePath) {
  const { data, content } = await readMarkdownFile(filePath);
  const filename = path.basename(filePath);

  // Skip template/example files
  if (filename.startsWith('_') || filename === 'example-club.mdx') {
    return;
  }

  // Check required frontmatter
  for (const field of REQUIRED_FRONTMATTER.club) {
    if (!data[field]) {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }

  // Check required sections
  for (const section of REQUIRED_SECTIONS.club) {
    if (!content.includes(section)) {
      logError(filePath, `Missing required section: ${section}`);
    }
  }

  // Warn if still using old contributions/ link
  if (content.includes('contributions/')) {
    logWarning(filePath, 'Profile links to "contributions/" - should use "donations/"');
  }

  // Verify donations link exists and points to correct path
  const slug = path.basename(filePath, '.mdx');
  if (!content.includes(`donations/clubs/${slug}/`)) {
    logWarning(filePath, `Expected donations link to "donations/clubs/${slug}/"`);
  }
}

// =============================================================================
// DONATION VALIDATION
// =============================================================================
// Path: donations/{clubs|donors|organizations}/{slug}/{year}/*.mdx
// Frontmatter: title, date, amount, token, chain, tx_hash
// Optional: donor_name, anonymous, message
// =============================================================================

async function validateDonation(filePath) {
  const { data, content } = await readMarkdownFile(filePath);
  const filename = path.basename(filePath);

  // Skip template and overview files
  if (filename.startsWith('_') || filename === 'overview.mdx') {
    return;
  }

  // Check required frontmatter
  for (const field of REQUIRED_FRONTMATTER.donation) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }

  // Validate date
  if (data.date && !validateDate(data.date)) {
    logError(filePath, `Invalid date format: ${data.date}. Use YYYY-MM-DD`);
  }

  // Validate amount is numeric
  if (data.amount !== undefined) {
    const amount = typeof data.amount === 'number' ? data.amount : parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      logError(filePath, `Invalid amount: ${data.amount}. Must be a positive number`);
    }
  }

  // Validate token (warning only - allow new tokens)
  if (data.token && !VALID_TOKENS.includes(data.token.toUpperCase())) {
    logWarning(filePath, `Unknown token: ${data.token}. Known tokens: ${VALID_TOKENS.join(', ')}`);
  }

  // Validate chain (warning only - allow new chains)
  if (data.chain && !VALID_CHAINS.includes(data.chain.toLowerCase())) {
    logWarning(filePath, `Unknown chain: ${data.chain}. Known chains: ${VALID_CHAINS.join(', ')}`);
  }

  // Validate path structure: donations/{type}/{slug}/{year}/...
  const pathParts = filePath.split(path.sep);
  const donationsIndex = pathParts.indexOf('donations');
  if (donationsIndex >= 0) {
    const entityTypeFolder = pathParts[donationsIndex + 1]; // 'clubs', 'donors', or 'organizations'

    if (!['clubs', 'donors', 'organizations'].includes(entityTypeFolder)) {
      logError(filePath, `Invalid entity type folder: ${entityTypeFolder}. Must be one of: clubs, donors, organizations`);
    }

    // Validate year folder is numeric
    const yearFolder = pathParts[donationsIndex + 3];
    if (yearFolder && !/^\d{4}$/.test(yearFolder)) {
      logWarning(filePath, `Year folder "${yearFolder}" should be a 4-digit year (e.g., 2026)`);
    }
  }
}

// =============================================================================
// PROPOSAL VALIDATION
// =============================================================================
// Path: proposals/{year}/{season}/*.mdx
// Frontmatter: title, proposer, date, requested_amount_usd
// Status/season tracked via badges in body, not frontmatter
// =============================================================================

async function validateProposal(filePath) {
  const { data, content } = await readMarkdownFile(filePath);
  const filename = path.basename(filePath);

  // Skip overview and template/instruction files
  if (filename === 'overview.mdx' || filename.startsWith('_')) {
    return;
  }

  // Check required frontmatter
  for (const field of REQUIRED_FRONTMATTER.proposal) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      logError(filePath, `Missing required frontmatter field: ${field}`);
    }
  }

  // Validate date
  if (data.date && !validateDate(data.date)) {
    logError(filePath, `Invalid date format: ${data.date}. Use YYYY-MM-DD`);
  }

  // Validate requested_amount_usd is numeric
  if (data.requested_amount_usd !== undefined) {
    const amount =
      typeof data.requested_amount_usd === 'number'
        ? data.requested_amount_usd
        : parseFloat(data.requested_amount_usd);
    if (isNaN(amount) || amount < 0) {
      logError(filePath, `Invalid requested_amount_usd: ${data.requested_amount_usd}. Must be a non-negative number`);
    }
  }

  // Validate path structure: proposals/{year}/{season}/...
  const pathParts = filePath.split(path.sep);
  const proposalsIndex = pathParts.indexOf('proposals');
  if (proposalsIndex >= 0 && proposalsIndex + 2 < pathParts.length) {
    const yearFolder = pathParts[proposalsIndex + 1];
    const seasonFolder = pathParts[proposalsIndex + 2];

    // Validate year is numeric
    if (!/^\d{4}$/.test(yearFolder)) {
      logWarning(filePath, `Year folder "${yearFolder}" should be a 4-digit year`);
    }

    // Validate season
    if (!VALID_SEASONS.includes(seasonFolder)) {
      logWarning(filePath, `Season folder "${seasonFolder}" should be one of: ${VALID_SEASONS.join(', ')}`);
    }
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('🔍 Validating College DAO repository...\n');

  // Validate clubs
  console.log('📋 Checking clubs...');
  const clubFiles = await globby('clubs/*.mdx', {
    ignore: ['clubs/_LEADERBOARD.mdx'],
  });
  for (const file of clubFiles) {
    await validateClub(file);
  }
  console.log(`   Found ${clubFiles.length} club files`);

  // Validate donations
  console.log('\n💰 Checking donations...');
  const donationFiles = await globby('donations/**/*.mdx', {
    ignore: ['**/overview.mdx', '**/_template.mdx'],
  });
  for (const file of donationFiles) {
    await validateDonation(file);
  }
  console.log(`   Found ${donationFiles.length} donation files`);

  // Validate proposals
  console.log('\n📜 Checking proposals...');
  const proposalFiles = await globby('proposals/**/*.mdx', {
    ignore: ['**/overview.mdx'],
  });
  for (const file of proposalFiles) {
    await validateProposal(file);
  }
  console.log(`   Found ${proposalFiles.length} proposal files`);

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

main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
