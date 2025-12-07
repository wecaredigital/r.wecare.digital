// MFA/TOTP Utility Functions
const crypto = require('crypto');

/**
 * Generate a random base32 secret for TOTP
 */
function generateSecret() {
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Base32 encoding (RFC 4648)
 */
function base32Encode(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decoding
 */
function base32Decode(encoded) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = Buffer.alloc(Math.ceil(encoded.length * 5 / 8));

  for (let i = 0; i < encoded.length; i++) {
    const char = encoded.charAt(i).toUpperCase();
    const charValue = alphabet.indexOf(char);
    
    if (charValue === -1) continue;

    value = (value << 5) | charValue;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}

/**
 * Generate TOTP code for a given secret and time
 */
function generateTOTP(secret, timeStep = 30, digits = 6) {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  return generateHOTP(secret, time, digits);
}

/**
 * Generate HOTP code
 */
function generateHOTP(secret, counter, digits = 6) {
  const decodedSecret = base32Decode(secret);
  
  // Create counter buffer (8 bytes, big-endian)
  const buffer = Buffer.alloc(8);
  let tmp = counter;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tmp & 0xff;
    tmp = tmp >> 8;
  }

  // Generate HMAC
  const hmac = crypto.createHmac('sha1', decodedSecret);
  hmac.update(buffer);
  const hmacResult = hmac.digest();

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = (
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff)
  );

  // Generate digits
  const otp = code % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Verify TOTP code with time window tolerance
 */
function verifyTOTP(secret, token, window = 1, timeStep = 30) {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  
  // Check current time and adjacent windows
  for (let i = -window; i <= window; i++) {
    const totp = generateHOTP(secret, time + i, 6);
    if (totp === token) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate QR code URL for authenticator apps
 */
function generateQRCodeUrl(secret, accountName, issuer = 'WECARE.DIGITAL') {
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  return otpauthUrl;
}

module.exports = {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateQRCodeUrl
};
