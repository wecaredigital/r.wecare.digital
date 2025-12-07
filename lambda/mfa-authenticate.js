// Lambda function to authenticate with MFA code during login
const AWS = require('aws-sdk');
const { verifyTOTP } = require('./mfa-utils');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'LinkTable';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  try {
    const userId = event.requestContext.authorizer.claims.email || 
                   event.requestContext.authorizer.claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Unauthorized' })
      };
    }

    const body = JSON.parse(event.body);
    const { code } = body;

    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing verification code' })
      };
    }

    // Get user's MFA secret
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: `mfa_${userId}` }
    }).promise();

    if (!result.Item || !result.Item.enabled) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'MFA not enabled for this user' })
      };
    }

    // Verify the TOTP code
    const isValid = verifyTOTP(result.Item.secretCode, code, 1);

    if (!isValid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          message: 'Invalid verification code',
          authenticated: false
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'MFA verification successful',
        authenticated: true
      })
    };
  } catch (error) {
    console.error('Error authenticating MFA:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
