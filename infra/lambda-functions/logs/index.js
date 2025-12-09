const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const LOGS_TABLE = process.env.LOGS_TABLE;
const CATS_TABLE = process.env.CATS_TABLE;

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

function getUserId(event) {
  return event.requestContext?.authorizer?.lambda?.userId || 
         event.requestContext?.authorizer?.userId;
}

// Create health log
async function createLog(event) {
  const userId = getUserId(event);
  const body = JSON.parse(event.body || '{}');
  
  const { catId, date, weight, temperature, appetite, energy, vomiting, diarrhea, urination, notes } = body;

  if (!catId || !date) {
    return response(400, { error: 'Cat ID and date are required' });
  }

  // Verify cat ownership
  const catCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const catResult = await docClient.send(catCommand);
  if (!catResult.Item || catResult.Item.userId !== userId) {
    return response(404, { error: 'Cat not found' });
  }

  const logId = uuidv4();
  const log = {
    logId,
    catId,
    userId,
    date,
    weight,
    temperature,
    appetite,
    energy,
    vomiting: vomiting || false,
    diarrhea: diarrhea || false,
    urination,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const putCommand = new PutCommand({
    TableName: LOGS_TABLE,
    Item: log
  });

  await docClient.send(putCommand);

  return response(201, { message: 'Log created successfully', log });
}

// Get logs for a cat
async function getLogs(event) {
  const userId = getUserId(event);
  const catId = event.queryStringParameters?.catId;

  if (!catId) {
    return response(400, { error: 'Cat ID is required' });
  }

  // Verify cat ownership
  const catCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const catResult = await docClient.send(catCommand);
  if (!catResult.Item || catResult.Item.userId !== userId) {
    return response(404, { error: 'Cat not found' });
  }

  const queryCommand = new QueryCommand({
    TableName: LOGS_TABLE,
    IndexName: 'CatIdIndex',
    KeyConditionExpression: 'catId = :catId',
    ExpressionAttributeValues: {
      ':catId': catId
    },
    ScanIndexForward: false // Sort by date descending
  });

  const result = await docClient.send(queryCommand);

  return response(200, { logs: result.Items || [] });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.rawPath || event.path;

    if (method === 'POST' && path === '/logs') {
      return await createLog(event);
    } else if (method === 'GET' && path === '/logs') {
      return await getLogs(event);
    } else {
      return response(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};