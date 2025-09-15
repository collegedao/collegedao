import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export async function readMarkdownFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  return matter(content);
}

export async function writeMarkdownFile(filePath, data, content) {
  // Convert any Date objects in data to strings
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
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

export const REQUIRED_FRONTMATTER = {
  profile: {
    club: ['name', 'slug', 'type', 'university', 'region', 'website'],
    organization: ['name', 'slug', 'type', 'region', 'website'],
    donor: ['name', 'slug', 'type', 'region', 'website']
  },
  contribution: ['title', 'date', 'season', 'year', 'entity_type'],
  proposal: ['title', 'proposer', 'season', 'year', 'category', 'status']
};

export const REQUIRED_SECTIONS = {
  profile: ['# Overview', '## Wallets', '## Contributions', '## Totals'],
  proposal: ['# Summary', '## Motivation & Impact', '## Budget & Milestones'],
  contribution: ['# Summary', '## Evidence', '## Financials']
};

export const VALID_SEASONS = ['spring', 'summer', 'fall', 'winter'];
export const VALID_ENTITY_TYPES = ['club', 'organization', 'donor'];
export const VALID_PROPOSAL_CATEGORIES = ['admission', 'budget', 'policy', 'treasury', 'other'];
export const VALID_PROPOSAL_STATUSES = ['draft', 'voting', 'approved', 'rejected', 'executed'];

export async function getAllFiles(dir, pattern = '**/*.md') {
  const { globby } = await import('globby');
  return globby(pattern, { cwd: dir, absolute: true });
}