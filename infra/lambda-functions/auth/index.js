const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({ region: process.env.AWS_REGION });

const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET_NAME = process.env.JWT_SECRET_NAME;
const DB_ENCRYPTION_KEY_NAME = process.env.DB_ENCRYPTION_KEY_NAME;

let jwtSecret = null;
let encryptionKey = null;

// Cache secrets
async function getSecret(secretName) {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await secretsClient.send(command);
  return response.SecretString;
}

async function initSecrets() {
  if (!jwtSecret) {
    jwtSecret = await getSecret(JWT_SECRET_NAME);
  }
  if (!encryptionKey) {
    encryptionKey = await getSecret(DB_ENCRYPTION_KEY_NAME);
  }
}

// Encrypt sensitive data
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Response helper
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

// Register handler
async function register(body) {
  const { email, password, name, phone } = body;

  if (!email || !password || !name) {
    return response(400, { error: 'Email, password, and name are required' });
  }

  // Check if user already exists
  const getCommand = new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId: email }
  });

  const existingUser = await docClient.send(getCommand);
  if (existingUser.Item) {
    return response(409, { error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Encrypt sensitive data
  const encryptedPhone = phone ? encrypt(phone) : null;

  // Create user
  const userId = email;
  const user = {
    userId,
    email,
    password: hashedPassword,
    name,
    phone: encryptedPhone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const putCommand = new PutCommand({
    TableName: USERS_TABLE,
    Item: user
  });

  await docClient.send(putCommand);

  // Generate JWT
  const token = jwt.sign({ userId, email, name }, jwtSecret, { expiresIn: '7d' });

  return response(201, {
    message: 'User registered successfully',
    token,
    user: {
      userId,
      email,
      name
    }
  });
}

// Login handler
async function login(body) {
  const { email, password } = body;

  if (!email || !password) {
    return response(400, { error: 'Email and password are required' });
  }

  // Get user
  const getCommand = new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId: email }
  });

  const result = await docClient.send(getCommand);
  if (!result.Item) {
    return response(401, { error: 'Invalid credentials' });
  }

  const user = result.Item;

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return response(401, { error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { userId: user.userId, email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: '7d' }
  );

  return response(200, {
    message: 'Login successful',
    token,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name
    }
  });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    await initSecrets();

    const path = event.rawPath || event.path;
    const body = JSON.parse(event.body || '{}');

    if (path === '/auth/register') {
      return await register(body);
    } else if (path === '/auth/login') {
      return await login(body);
    } else {
      return response(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};