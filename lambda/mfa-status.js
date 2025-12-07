// Lambda function to check MFA status
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'LinkTable';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
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

    // Check if MFA is enabled for this user
    const result = await dynamodb.get({
      TableName: TABLE_NAME,
      Key: { id: `mfa_${userId}` }
    }).promise();

    const mfaEnabled = result.Item && result.Item.enabled === true;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        mfaEnabled: mfaEnabled
      })
    };
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
