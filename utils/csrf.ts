'use server';

import crypto from 'crypto';

const ENCRYPTION_KEY_BASE64 = process.env.ENCRYPTION_KEY || ''; // Replace with your encryption key in Base64
const RANDOM_BYTES_LENGTH = 16; // Length of random bytes
const GCM_NONCE_LENGTH = 12; // GCM nonce size is 12 bytes

if (!ENCRYPTION_KEY_BASE64) {
    throw new Error('ENCRYPTION_KEY is not set');
}

// Decode the Base64 encryption key
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_BASE64, 'base64');

// Encrypts the token using AES-GCM
function encryptToken(plaintext: string, key: Buffer): string {
    const nonce = crypto.randomBytes(GCM_NONCE_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    const ciphertext = Buffer.concat([encrypted, authTag]);
    const result = Buffer.concat([nonce, ciphertext]);
    return result.toString('base64');
}

// Generates a new CSRF token with a timestamp and random bytes
export async function generateCSRFToken(): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const randomBytes = crypto.randomBytes(RANDOM_BYTES_LENGTH).toString('hex');
    const plaintext = `${randomBytes}|${timestamp}`;

    return encryptToken(plaintext, ENCRYPTION_KEY);
}