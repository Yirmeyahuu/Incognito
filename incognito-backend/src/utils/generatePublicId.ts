import crypto from 'crypto';

/**
 * Generates a random, non-guessable public ID
 * Format: 12 characters, URL-safe (alphanumeric)
 */
export const generatePublicId = (): string => {
  const buffer = crypto.randomBytes(9); // 9 bytes = 12 base64 characters
  return buffer
    .toString('base64')
    .replace(/\+/g, '0')
    .replace(/\//g, '1')
    .replace(/=/g, '');
};