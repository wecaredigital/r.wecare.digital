#!/bin/bash

# MFA Deployment Script for URL Shortener
# This script helps deploy the MFA/TOTP feature

set -e

echo "=========================================="
echo "MFA/TOTP Deployment Script"
echo "=========================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "⚠️  SAM CLI is not installed. You'll need to deploy manually."
    echo "   Install SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
fi

echo "Step 1: Installing frontend dependencies..."
cd client
npm install
echo "✅ Frontend dependencies installed"
echo ""

echo "Step 2: Installing Lambda dependencies..."
cd ../lambda
npm install
echo "✅ Lambda dependencies installed"
echo ""

cd ..

echo "Step 3: Building Lambda deployment package..."
cd lambda
zip -r ../mfa-functions.zip *.js node_modules/
cd ..
echo "✅ Lambda package created: mfa-functions.zip"
echo ""

echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Deploy Lambda functions:"
echo "   - Upload mfa-functions.zip to AWS Lambda"
echo "   - Create 5 Lambda functions (see MFA_IMPLEMENTATION.md)"
echo "   - Set TABLE_NAME environment variable"
echo ""
echo "2. Update API Gateway:"
echo "   - Import updated api.yaml"
echo "   - Deploy API to stage"
echo ""
echo "3. Enable DynamoDB TTL:"
echo "   aws dynamodb update-time-to-live \\"
echo "     --table-name LinkTable \\"
echo "     --time-to-live-specification \"Enabled=true, AttributeName=ttl\""
echo ""
echo "4. Deploy frontend:"
echo "   cd client"
echo "   npm run build"
echo "   # Deploy to Amplify or S3"
echo ""
echo "For detailed instructions, see MFA_IMPLEMENTATION.md"
echo ""
