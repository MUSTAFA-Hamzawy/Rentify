const crypto = require('crypto');

// Generate a 256-bit (32-byte) access token key
const accessTokenKey = crypto.randomBytes(32).toString('hex');

// Generate a 256-bit (32-byte) refresh token key
const refreshTokenKey = crypto.randomBytes(32).toString('hex');

// Generate a 160-bit (20-byte) OTP secret key
const otpSecretKey = crypto.randomBytes(20).toString('hex');

console.log('JWT_ACCESS_TOKEN_KEY=', accessTokenKey);
console.log('JWT_REFRESH_TOKEN_KEY=', refreshTokenKey);
console.log('OTP_SECRET_KEY=', otpSecretKey);
