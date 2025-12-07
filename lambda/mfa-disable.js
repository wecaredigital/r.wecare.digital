// Lambda function to disable MFA
const AWS = require('aws-sdk');

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

    // Delete MFA configuration
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: `mfa_${userId}` }
    }).promise();

    // Also delete any temporary setup sessions
    await dynamodb.delete({
      TableName: TABLE_NAME,
      Key: { id: `mfa_temp_${userId}` }
    }).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'MFA disabled successfully',
        mfaEnabled: false
      })
    };
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
