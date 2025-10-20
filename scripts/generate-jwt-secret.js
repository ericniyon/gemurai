const crypto = require('crypto');

// Generate a secure random string of 64 bytes and convert it to base64
const generateJwtSecret = () => {
  const secret = crypto.randomBytes(64).toString('base64');
  console.log('Generated JWT_SECRET:');
  console.log(secret);
  console.log('\nAdd this to your .env file as:');
  console.log('JWT_SECRET=' + secret);
};

// Generate a 32-byte (256-bit) encryption key
const generateEncryptionKey = () => {
  const key = crypto.randomBytes(32).toString('base64');
  console.log('\nGenerated ENCRYPTION_KEY:');
  console.log(key);
  console.log('\nAdd this to your .env file as:');
  console.log('ENCRYPTION_KEY=' + key);
};

// Generate NextAuth secret
const generateNextAuthSecret = () => {
  // Using 32 bytes for NextAuth secret as recommended
  const secret = crypto.randomBytes(32).toString('base64');
  console.log('\nGenerated NEXTAUTH_SECRET:');
  console.log(secret);
  console.log('\nAdd this to your .env file as:');
  console.log('NEXTAUTH_SECRET=' + secret);
};

console.log('Generating secure keys...\n');
generateJwtSecret();
generateEncryptionKey();
generateNextAuthSecret(); 