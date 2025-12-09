const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const jwt = require('jsonwebtoken');

const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });
const JWT_SECRET_NAME = process.env.JWT_SECRET_NAME;

let jwtSecret = null;

async function getSecret(secretName) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);
  return response.SecretString;
}

exports.handler = async (event) => {
  console.log('Authorizer Event:', JSON.stringify(event, null, 2));

  try {
    if (!jwtSecret) {
      jwtSecret = await getSecret(JWT_SECRET_NAME);
    }

    const token = event.headers?.authorization?.replace('Bearer ', '') || 
                  event.headers?.Authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('No token provided');
      return {
        isAuthorized: false
      };
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token verified for user:', decoded.userId);

    return {
      isAuthorized: true,
      context: {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name
      }
    };
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      isAuthorized: false
    };
  }
};