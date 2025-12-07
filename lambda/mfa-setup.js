// Lambda function to initiate MFA setup
const AWS = require('aws-sdk');
const { generateSecret, generateQRCodeUrl } = require('./mfa-utils');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'LinkTable';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  };

  try {
    // Extract user from JWT token (Cognito authorizer adds this to context)
    const userId = event.requestContext.authorizer.claims.email || 
                   event.requestContext.authorizer.claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    // Generate new TOTP secret
    const secret = generateSecret();
    const qrCodeUrl = generateQRCodeUrl(secret, userId);

    // Store temporary secret in DynamoDB (will be confirmed after verification)
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: {
        id: `mfa_temp_${userId}`,
        owner: userId,
        secretCode: secret,
        verified: false,
        timestamp: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 600 // Expire in 10 minutes
      }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        secretCode: secret,
        qrCodeUrl: qrCodeUrl
      })
    };
  } catch (error) {
    console.error('Error in MFA setup:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
