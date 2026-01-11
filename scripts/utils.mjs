import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function readMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return matter(content);
}

export async function writeMarkdownFile(filePath, data, content) {
  const cleanData = { ...data };
  if (cleanData.date instanceof Date) {
    cleanData.date = cleanData.date.toISOString().split('T')[0];
  }
  const output = matter.stringify(content, cleanData);
  await fs.writeFile(filePath, output);
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}

export function parseAmount(amountStr) {
  if (typeof amountStr === 'number') return amountStr;
  if (typeof amountStr !== 'string') return null;
  const match = amountStr.match(/^\$?([\d,]+\.?\d*)$/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ''));
}

export async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export function validateDate(dateStr) {
  if (dateStr instanceof Date) {
    return !isNaN(dateStr.getTime());
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export function toDateString(date) {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
}

// =============================================================================
// SCHEMA DEFINITIONS - Updated to match actual codebase structure
// =============================================================================

export const REQUIRED_FRONTMATTER = {
  club: ['name', 'university', 'region'],
  donation: ['title', 'date', 'amount', 'token', 'chain', 'tx_hash'],
  proposal: ['title', 'proposer', 'date', 'requested_amount_usd'],
};

export const REQUIRED_SECTIONS = {
  club: ['# About', '## Wallets', '## Donations', '## Totals'],
  donation: [],
  proposal: [],
};

export const VALID_TOKENS = ['USDC', 'SOL', 'ETH', 'USDT'];
export const VALID_CHAINS = ['solana', 'ethereum', 'base', 'polygon'];
export const VALID_ENTITY_TYPES = ['club', 'organization', 'donor'];
export const VALID_SEASONS = ['spring', 'summer', 'fall', 'winter'];

export async function getAllFiles(dir, pattern = '**/*.mdx') {
  const { globby } = await import('globby');
  return globby(pattern, { cwd: dir, absolute: true });
}
