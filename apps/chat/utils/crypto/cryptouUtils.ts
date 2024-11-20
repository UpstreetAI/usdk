import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const passphrase = 'passphrase'; 
const secretKey = crypto.pbkdf2Sync(passphrase, 'salt', 100000, 32, 'sha256');

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16); // Generate a unique IV for each encryption
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (hash: string): string => {
  try {
    const [ivHex, encryptedText] = hash.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedText, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Decryption failed. Check the key, IV, or ciphertext.');
  }
};
