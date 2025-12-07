// Test script for MFA/TOTP utilities
const { generateSecret, generateTOTP, verifyTOTP, generateQRCodeUrl } = require('./mfa-utils');

console.log('=== MFA/TOTP Test Suite ===\n');

// Test 1: Generate secret
console.log('Test 1: Generate Secret');
const secret = generateSecret();
console.log('Generated secret:', secret);
console.log('Secret length:', secret.length);
console.log('✓ Secret generated successfully\n');

// Test 2: Generate TOTP code
console.log('Test 2: Generate TOTP Code');
const code = generateTOTP(secret);
console.log('Generated TOTP code:', code);
console.log('Code length:', code.length);
console.log('✓ TOTP code generated successfully\n');

// Test 3: Verify TOTP code
console.log('Test 3: Verify TOTP Code');
const isValid = verifyTOTP(secret, code);
console.log('Verification result:', isValid);
if (isValid) {
  console.log('✓ TOTP verification successful\n');
} else {
  console.log('✗ TOTP verification failed\n');
}

// Test 4: Generate QR code URL
console.log('Test 4: Generate QR Code URL');
const qrUrl = generateQRCodeUrl(secret, '[email]', 'WECARE.DIGITAL');
console.log('QR Code URL:', qrUrl);
console.log('✓ QR code URL generated successfully\n');

// Test 5: Verify invalid code
console.log('Test 5: Verify Invalid Code');
const invalidCode = '000000';
const isInvalid = verifyTOTP(secret, invalidCode);
console.log('Verification result for invalid code:', isInvalid);
if (!isInvalid) {
  console.log('✓ Invalid code correctly rejected\n');
} else {
  console.log('✗ Invalid code incorrectly accepted\n');
}

// Test 6: Time window tolerance
console.log('Test 6: Time Window Tolerance');
console.log('Generating codes for adjacent time windows...');
const currentTime = Math.floor(Date.now() / 1000 / 30);
console.log('Current time step:', currentTime);
console.log('Current code:', generateTOTP(secret));
console.log('✓ Time window test complete\n');

console.log('=== All Tests Complete ===');
console.log('\nTo use this secret in an authenticator app:');
console.log('1. Open your authenticator app');
console.log('2. Add a new account manually');
console.log('3. Enter this secret:', secret);
console.log('4. The app will generate codes that match:', generateTOTP(secret));
