const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const LOGS_TABLE = process.env.LOGS_TABLE_NAME;
const CATS_TABLE = process.env.CATS_TABLE_NAME;

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

// Get user ID from JWT token
function getUserId(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (claims) {
    return claims.sub || claims['cognito:username'];
  }
  return event.requestContext?.authorizer?.userId;
}

// Create health log
async function createLog(event) {
  const userId = getUserId(event);
  
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }
  
  const body = JSON.parse(event.body || '{}');
  
  const { catId, date, pooCount, peeCount, foodCount, waterCount, weight, temperature, notes } = body;

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

  // Generate logId for frontend reference
  const logId = `${catId}_${date}`;  // Composite: catId + date
  
  const log = {
    catId,        // Partition key
    date,         // Sort key
    logId,        // For frontend reference
    userId,
    pooCount: pooCount || 0,
    peeCount: peeCount || 0,
    foodCount: foodCount || 0,
    waterCount: waterCount || 0,
    weight: weight || null,
    temperature: temperature || null,
    notes: notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const putCommand = new PutCommand({
    TableName: LOGS_TABLE,
    Item: log
  });

  await docClient.send(putCommand);

  // Return with 'id' for frontend compatibility
  return response(201, { 
    message: 'Log created successfully', 
    log: { ...log, id: logId }
  });
}

// Get logs for a cat
async function getLogs(event) {
  const userId = getUserId(event);
  const catId = event.queryStringParameters?.catId;

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  if (catId) {
    // Get logs for specific cat
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
      KeyConditionExpression: 'catId = :catId',
      ExpressionAttributeValues: {
        ':catId': catId
      },
      ScanIndexForward: false // Sort by date descending
    });

    const result = await docClient.send(queryCommand);

    const logs = (result.Items || []).map(log => ({
      ...log,
      id: log.logId || `${log.catId}_${log.date}`
    }));

    return response(200, { logs });
  } else {
    // Get ALL logs for user (across all their cats)
    const queryCommand = new QueryCommand({
      TableName: LOGS_TABLE,
      IndexName: 'userId-date-index',  // Need this GSI!
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by date descending
    });

    const result = await docClient.send(queryCommand);

    const logs = (result.Items || []).map(log => ({
      ...log,
      id: log.logId || `${log.catId}_${log.date}`
    }));

    return response(200, { logs });
  }
}

// Get single log
async function getLog(event) {
  const userId = getUserId(event);
  const id = event.pathParameters?.id;  // Format: catId_date

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  if (!id) {
    return response(400, { error: 'Log ID is required' });
  }

  // Parse composite ID
  const [catId, date] = id.split('_');
  
  if (!catId || !date) {
    return response(400, { error: 'Invalid log ID format' });
  }

  // Get the log using composite key
  const getCommand = new GetCommand({
    TableName: LOGS_TABLE,
    Key: { catId, date }
  });

  const result = await docClient.send(getCommand);

  if (!result.Item) {
    return response(404, { error: 'Log not found' });
  }

  // Verify cat ownership
  const catCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId: result.Item.catId }
  });

  const catResult = await docClient.send(catCommand);
  if (!catResult.Item || catResult.Item.userId !== userId) {
    return response(404, { error: 'Log not found' });
  }

  return response(200, { 
    log: { ...result.Item, id: result.Item.logId || id }
  });
}

// Update log
async function updateLog(event) {
  const userId = getUserId(event);
  const id = event.pathParameters?.id;  // Format: catId_date
  const body = JSON.parse(event.body || '{}');

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  if (!id) {
    return response(400, { error: 'Log ID is required' });
  }

  // Parse composite ID
  const [catId, date] = id.split('_');
  
  if (!catId || !date) {
    return response(400, { error: 'Invalid log ID format' });
  }

  // Get existing log
  const getCommand = new GetCommand({
    TableName: LOGS_TABLE,
    Key: { catId, date }
  });

  const existing = await docClient.send(getCommand);
  if (!existing.Item) {
    return response(404, { error: 'Log not found' });
  }

  // Verify cat ownership
  const catCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const catResult = await docClient.send(catCommand);
  if (!catResult.Item || catResult.Item.userId !== userId) {
    return response(404, { error: 'Log not found' });
  }

  // Build update expression
  const updates = [];
  const values = {};

  if (body.pooCount !== undefined) {
    updates.push('pooCount = :pooCount');
    values[':pooCount'] = body.pooCount;
  }
  if (body.peeCount !== undefined) {
    updates.push('peeCount = :peeCount');
    values[':peeCount'] = body.peeCount;
  }
  if (body.foodCount !== undefined) {
    updates.push('foodCount = :foodCount');
    values[':foodCount'] = body.foodCount;
  }
  if (body.waterCount !== undefined) {
    updates.push('waterCount = :waterCount');
    values[':waterCount'] = body.waterCount;
  }
  if (body.weight !== undefined) {
    updates.push('weight = :weight');
    values[':weight'] = body.weight;
  }
  if (body.temperature !== undefined) {
    updates.push('temperature = :temperature');
    values[':temperature'] = body.temperature;
  }
  if (body.notes !== undefined) {
    updates.push('notes = :notes');
    values[':notes'] = body.notes;
  }

  updates.push('updatedAt = :updatedAt');
  values[':updatedAt'] = new Date().toISOString();

  const updateCommand = new UpdateCommand({
    TableName: LOGS_TABLE,
    Key: { catId, date },
    UpdateExpression: `SET ${updates.join(', ')}`,
    ExpressionAttributeValues: values,
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(updateCommand);

  return response(200, { 
    message: 'Log updated successfully', 
    log: { ...result.Attributes, id: result.Attributes.logId || id }
  });
}

// Delete log
async function deleteLog(event) {
  const userId = getUserId(event);
  const id = event.pathParameters?.id;  // Format: catId_date

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  if (!id) {
    return response(400, { error: 'Log ID is required' });
  }

  // Parse composite ID
  const [catId, date] = id.split('_');
  
  if (!catId || !date) {
    return response(400, { error: 'Invalid log ID format' });
  }

  // Get existing log
  const getCommand = new GetCommand({
    TableName: LOGS_TABLE,
    Key: { catId, date }
  });

  const existing = await docClient.send(getCommand);
  if (!existing.Item) {
    return response(404, { error: 'Log not found' });
  }

  // Verify cat ownership
  const catCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const catResult = await docClient.send(catCommand);
  if (!catResult.Item || catResult.Item.userId !== userId) {
    return response(404, { error: 'Log not found' });
  }

  const deleteCommand = new DeleteCommand({
    TableName: LOGS_TABLE,
    Key: { catId, date }
  });

  await docClient.send(deleteCommand);

  return response(200, { message: 'Log deleted successfully' });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    let path = event.rawPath || event.path;
    
    // Remove stage prefix
    if (path.startsWith('/dev/')) {
      path = path.replace('/dev', '');
    } else if (path.startsWith('/prod/')) {
      path = path.replace('/prod', '');
    }

    console.log('Processing:', method, path);

    if (method === 'POST' && path === '/logs') {
      return await createLog(event);
    } else if (method === 'GET' && path === '/logs') {
      return await getLogs(event);
    } else if (method === 'GET' && path.match(/^\/logs\/[^/]+$/)) {
      return await getLog(event);
    } else if (method === 'PUT' && path.match(/^\/logs\/[^/]+$/)) {
      return await updateLog(event);
    } else if (method === 'DELETE' && path.match(/^\/logs\/[^/]+$/)) {
      return await deleteLog(event);
    } else {
      return response(404, { error: 'Not found', path, method });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};