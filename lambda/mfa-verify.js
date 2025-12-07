// Lambda function to verify and enable MFA
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
    const { code, secretCode } = body;

    if (!code || !secretCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Missing code or secret' })
      };
    }

    // Verify the TOTP code
    const isValid = verifyTOTP(secretCode, code, 1);

    if (!isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid verification code' })
      };
    }

    // Get temporary secret from DynamoDB
    const tempResult = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: `mfa_temp_${userId}` }
    }).promise();

    if (!tempResult.Item || tempResult.Item.secretCode !== secretCode) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid or expired setup session' })
      };
    }

    // Save verified MFA secret
    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: {
        id: `mfa_${userId}`,
        owner: userId,
        secretCode: secretCode,
        verified: true,
        enabled: true,
        timestamp: new Date().toISOString()
      }
    }).promise();

    // Delete temporary secret
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: `mfa_temp_${userId}` }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'MFA enabled successfully',
        mfaEnabled: true
      })
    };
  } catch (error) {
    console.error('Error verifying MFA:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
