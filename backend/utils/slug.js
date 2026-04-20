const crypto = require('crypto');

const baseSlug = (input) =>
  String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'workspace';

/**
 * Generate a workspace slug that is (very likely) unique.
 * We do not round-trip a DB check here — callers rely on the unique index
 * on Workspace.slug to enforce uniqueness and retry if they hit a duplicate.
 */
exports.generateSlug = (input) => {
  const suffix = crypto.randomBytes(3).toString('hex'); // 6 hex chars
  return `${baseSlug(input)}-${suffix}`;
};

exports.baseSlug = baseSlug;
