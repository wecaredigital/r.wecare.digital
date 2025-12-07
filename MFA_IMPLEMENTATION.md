# MFA/TOTP Implementation Guide

This guide explains how to deploy and use the MFA/TOTP authentication feature added to your URL shortener application.

## Overview

The implementation adds Time-based One-Time Password (TOTP) authentication to your application, allowing users to secure their accounts with authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator.

## Architecture

### Frontend Components
- **MFASetup.vue**: Component for enabling/disabling MFA and displaying QR codes
- **MFAVerification.vue**: Modal component for entering TOTP codes during login
- Updated **Dashboard.vue**: Includes MFA settings button

### Backend Lambda Functions
- **mfa-setup.js**: Generates TOTP secret and QR code URL
- **mfa-verify.js**: Verifies TOTP code and enables MFA
- **mfa-authenticate.js**: Validates TOTP during login
- **mfa-status.js**: Checks if MFA is enabled for a user
- **mfa-disable.js**: Disables MFA for a user
- **mfa-utils.js**: Utility functions for TOTP generation and verification

### API Endpoints
- `GET /app/mfa/status` - Check MFA status
- `POST /app/mfa/setup` - Initiate MFA setup
- `POST /app/mfa/verify` - Verify and enable MFA
- `POST /app/mfa/authenticate` - Authenticate with TOTP
- `POST /app/mfa/disable` - Disable MFA

## Deployment Steps

### 1. Install Frontend Dependencies

```bash
cd client
npm install
```

This will install the `qrcode` package needed for QR code generation.

### 2. Deploy Lambda Functions

The Lambda functions are located in the `lambda/` directory. You need to deploy them to AWS:

**Option A: Using SAM CLI**

```bash
# Build and deploy
sam build
sam deploy --guided
```

**Option B: Manual Deployment**

1. Create a deployment package:
```bash
cd lambda
zip -r mfa-functions.zip *.js
```

2. Upload to AWS Lambda via AWS Console or CLI
3. Configure environment variables:
   - `TABLE_NAME`: Your DynamoDB table name (LinkTable)

### 3. Update API Gateway

The `api.yaml` file has been updated with MFA endpoints. Deploy the updated API:

```bash
# If using AWS SAM
sam deploy

# Or update via AWS Console
# Import the updated api.yaml in API Gateway
```

### 4. Configure DynamoDB

Ensure your DynamoDB table has TTL enabled for automatic cleanup of temporary MFA setup sessions:

```bash
aws dynamodb update-time-to-live \
  --table-name LinkTable \
  --time-to-live-specification "Enabled=true, AttributeName=ttl"
```

### 5. Update CloudFormation Stack

Add the Lambda function definitions from `lambda-mfa-template.yaml` to your main `template.yaml` file, or deploy it as a nested stack.

### 6. Deploy Frontend

```bash
cd client
npm run build

# Deploy to Amplify (automatic if connected to GitHub)
# Or manually upload to S3
```

## Usage

### For End Users

1. **Enable MFA**:
   - Log in to the dashboard
   - Click "🔐 MFA Settings" button
   - Click "Enable MFA"
   - Scan the QR code with your authenticator app
   - Enter the 6-digit code to verify
   - MFA is now enabled

2. **Login with MFA**:
   - After entering credentials, you'll be prompted for a TOTP code
   - Open your authenticator app
   - Enter the 6-digit code
   - Access granted

3. **Disable MFA**:
   - Go to MFA Settings
   - Click "Disable MFA"
   - Confirm the action

## Security Considerations

1. **Secret Storage**: TOTP secrets are stored encrypted in DynamoDB
2. **Time Window**: TOTP codes are valid for 30 seconds with a 1-step tolerance window
3. **Temporary Secrets**: Setup secrets expire after 10 minutes if not verified
4. **User Isolation**: Each user's MFA configuration is isolated by user ID

## Testing

### Test MFA Setup

1. Log in to your application
2. Navigate to MFA Settings
3. Start MFA setup
4. Use a TOTP testing tool or authenticator app
5. Verify the code works

### Test TOTP Generation (Development)

You can test TOTP generation locally:

```javascript
const { generateTOTP, verifyTOTP } = require('./lambda/mfa-utils');

const secret = 'JBSWY3DPEHPK3PXP'; // Example secret
const code = generateTOTP(secret);
console.log('Generated code:', code);

const isValid = verifyTOTP(secret, code);
console.log('Is valid:', isValid);
```

## Troubleshooting

### QR Code Not Displaying
- Check browser console for errors
- Ensure `qrcode` package is installed
- Verify API endpoint is returning `qrCodeUrl`

### Invalid Code Errors
- Check device time synchronization
- Ensure TOTP secret matches between setup and verification
- Verify time window tolerance in `mfa-utils.js`

### API Errors
- Check Lambda function logs in CloudWatch
- Verify DynamoDB permissions
- Ensure Cognito authorizer is configured correctly

## API Response Examples

### Setup Response
```json
{
  "secretCode": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/WECARE.DIGITAL:[email]?secret=JBSWY3DPEHPK3PXP&issuer=WECARE.DIGITAL"
}
```

### Status Response
```json
{
  "mfaEnabled": true
}
```

### Verification Response
```json
{
  "message": "MFA enabled successfully",
  "mfaEnabled": true
}
```

## Future Enhancements

- Backup codes for account recovery
- SMS-based MFA as alternative
- MFA enforcement policies
- Admin dashboard for MFA management
- Audit logging for MFA events

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
