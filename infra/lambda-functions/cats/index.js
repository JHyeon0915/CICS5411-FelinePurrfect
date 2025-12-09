const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const CATS_TABLE = process.env.CATS_TABLE;
const CAT_PHOTOS_BUCKET = process.env.CAT_PHOTOS_BUCKET;

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

// Get user ID from authorizer context
function getUserId(event) {
  return event.requestContext?.authorizer?.lambda?.userId || 
         event.requestContext?.authorizer?.userId;
}

// Create cat
async function createCat(event) {
  const userId = getUserId(event);
  const body = JSON.parse(event.body || '{}');
  
  const { name, breed, dateOfBirth, weight, color, microchipId, photo } = body;

  if (!name || !breed) {
    return response(400, { error: 'Name and breed are required' });
  }

  const catId = uuidv4();
  let photoUrl = null;

  // Upload photo to S3 if provided (base64 encoded)
  if (photo) {
    const buffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const key = `${userId}/${catId}/profile.jpg`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: CAT_PHOTOS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(uploadCommand);
    
    // Generate presigned URL for photo
    const getCommand = new GetObjectCommand({
      Bucket: CAT_PHOTOS_BUCKET,
      Key: key
    });
    photoUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 86400 }); // 24 hours
  }

  const cat = {
    catId,
    userId,
    name,
    breed,
    dateOfBirth,
    weight,
    color,
    microchipId,
    photoUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const putCommand = new PutCommand({
    TableName: CATS_TABLE,
    Item: cat
  });

  await docClient.send(putCommand);

  return response(201, { message: 'Cat created successfully', cat });
}

// Get all cats for user
async function getCats(event) {
  const userId = getUserId(event);

  const queryCommand = new QueryCommand({
    TableName: CATS_TABLE,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const result = await docClient.send(queryCommand);

  return response(200, { cats: result.Items || [] });
}

// Get single cat
async function getCat(event) {
  const userId = getUserId(event);
  const catId = event.pathParameters?.id;

  if (!catId) {
    return response(400, { error: 'Cat ID is required' });
  }

  const getCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const result = await docClient.send(getCommand);

  if (!result.Item || result.Item.userId !== userId) {
    return response(404, { error: 'Cat not found' });
  }

  return response(200, { cat: result.Item });
}

// Update cat
async function updateCat(event) {
  const userId = getUserId(event);
  const catId = event.pathParameters?.id;
  const body = JSON.parse(event.body || '{}');

  if (!catId) {
    return response(400, { error: 'Cat ID is required' });
  }

  // Verify ownership
  const getCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const existing = await docClient.send(getCommand);
  if (!existing.Item || existing.Item.userId !== userId) {
    return response(404, { error: 'Cat not found' });
  }

  // Build update expression
  const updates = [];
  const values = {};
  const names = {};

  if (body.name) {
    updates.push('#name = :name');
    values[':name'] = body.name;
    names['#name'] = 'name';
  }
  if (body.breed) {
    updates.push('breed = :breed');
    values[':breed'] = body.breed;
  }
  if (body.dateOfBirth) {
    updates.push('dateOfBirth = :dateOfBirth');
    values[':dateOfBirth'] = body.dateOfBirth;
  }
  if (body.weight) {
    updates.push('weight = :weight');
    values[':weight'] = body.weight;
  }
  if (body.color) {
    updates.push('color = :color');
    values[':color'] = body.color;
  }

  updates.push('updatedAt = :updatedAt');
  values[':updatedAt'] = new Date().toISOString();

  const updateCommand = new UpdateCommand({
    TableName: CATS_TABLE,
    Key: { catId },
    UpdateExpression: `SET ${updates.join(', ')}`,
    ExpressionAttributeValues: values,
    ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(updateCommand);

  return response(200, { message: 'Cat updated successfully', cat: result.Attributes });
}

// Delete cat
async function deleteCat(event) {
  const userId = getUserId(event);
  const catId = event.pathParameters?.id;

  if (!catId) {
    return response(400, { error: 'Cat ID is required' });
  }

  // Verify ownership
  const getCommand = new GetCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  const existing = await docClient.send(getCommand);
  if (!existing.Item || existing.Item.userId !== userId) {
    return response(404, { error: 'Cat not found' });
  }

  const deleteCommand = new DeleteCommand({
    TableName: CATS_TABLE,
    Key: { catId }
  });

  await docClient.send(deleteCommand);

  return response(200, { message: 'Cat deleted successfully' });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.rawPath || event.path;

    if (method === 'POST' && path === '/cats') {
      return await createCat(event);
    } else if (method === 'GET' && path === '/cats') {
      return await getCats(event);
    } else if (method === 'GET' && path.startsWith('/cats/')) {
      return await getCat(event);
    } else if (method === 'PUT' && path.startsWith('/cats/')) {
      return await updateCat(event);
    } else if (method === 'DELETE' && path.startsWith('/cats/')) {
      return await deleteCat(event);
    } else {
      return response(404, { error: 'Not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};