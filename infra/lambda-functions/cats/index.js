const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: process.env.AWS_REGION });

const CATS_TABLE = process.env.CATS_TABLE_NAME;
const CAT_PHOTOS_BUCKET = process.env.CAT_PHOTOS_BUCKET_NAME;

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
  // From API Gateway JWT authorizer
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (claims) {
    return claims.sub || claims['cognito:username'];
  }
  
  // Fallback for custom authorizer
  return event.requestContext?.authorizer?.userId;
}

// Create cat
async function createCat(event) {
  const userId = getUserId(event);
  
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }
  
  const body = JSON.parse(event.body || '{}');
  
  const { name, age, sex, adoptedDate, weight, breed, color, microchipId, photo } = body;

  if (!name) {
    return response(400, { error: 'Name is required' });
  }

  const catId = uuidv4();
  let photoUrl = null;

  // Upload photo to S3 if provided (base64 encoded)
  if (photo) {
    try {
      const buffer = Buffer.from(photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const key = `${userId}/${catId}/profile.jpg`;
      
      const uploadCommand = new PutObjectCommand({
        Bucket: CAT_PHOTOS_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg'
      });

      await s3Client.send(uploadCommand);
      
      // Generate presigned URL for photo (7 days)
      const getCommand = new GetObjectCommand({
        Bucket: CAT_PHOTOS_BUCKET,
        Key: key
      });
      photoUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });
    } catch (error) {
      console.error('Photo upload error:', error);
      // Continue without photo
    }
  }

  const cat = {
    catId,
    userId,
    name,
    age: age || 0,
    sex: sex || 'female',
    adoptedDate: adoptedDate || new Date().toISOString(),
    weight: weight || null,
    breed: breed || null,
    color: color || null,
    microchipId: microchipId || null,
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
  
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  const queryCommand = new QueryCommand({
    TableName: CATS_TABLE,
    IndexName: 'userId-index',
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

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

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

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

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

  // Handle photo upload if new photo provided
  let photoUrl = existing.Item.photoUrl;
  if (body.photo && !body.photo.startsWith('http')) {
    try {
      const buffer = Buffer.from(body.photo.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const key = `${userId}/${catId}/profile.jpg`;
      
      const uploadCommand = new PutObjectCommand({
        Bucket: CAT_PHOTOS_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: 'image/jpeg'
      });

      await s3Client.send(uploadCommand);
      
      const getPhotoCommand = new GetObjectCommand({
        Bucket: CAT_PHOTOS_BUCKET,
        Key: key
      });
      photoUrl = await getSignedUrl(s3Client, getPhotoCommand, { expiresIn: 604800 });
    } catch (error) {
      console.error('Photo upload error:', error);
    }
  }

  // Build update expression
  const updates = [];
  const values = {};
  const names = {};

  if (body.name !== undefined) {
    updates.push('#name = :name');
    values[':name'] = body.name;
    names['#name'] = 'name';
  }
  if (body.age !== undefined) {
    updates.push('age = :age');
    values[':age'] = body.age;
  }
  if (body.sex !== undefined) {
    updates.push('sex = :sex');
    values[':sex'] = body.sex;
  }
  if (body.adoptedDate !== undefined) {
    updates.push('adoptedDate = :adoptedDate');
    values[':adoptedDate'] = body.adoptedDate;
  }
  if (body.weight !== undefined) {
    updates.push('weight = :weight');
    values[':weight'] = body.weight;
  }
  if (body.breed !== undefined) {
    updates.push('breed = :breed');
    values[':breed'] = body.breed;
  }
  if (body.color !== undefined) {
    updates.push('color = :color');
    values[':color'] = body.color;
  }
  if (body.microchipId !== undefined) {
    updates.push('microchipId = :microchipId');
    values[':microchipId'] = body.microchipId;
  }
  if (photoUrl) {
    updates.push('photoUrl = :photoUrl');
    values[':photoUrl'] = photoUrl;
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

  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

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

    if (method === 'POST' && path === '/cats') {
      return await createCat(event);
    } else if (method === 'GET' && path === '/cats') {
      return await getCats(event);
    } else if (method === 'GET' && path.match(/^\/cats\/[^/]+$/)) {
      return await getCat(event);
    } else if (method === 'PUT' && path.match(/^\/cats\/[^/]+$/)) {
      return await updateCat(event);
    } else if (method === 'DELETE' && path.match(/^\/cats\/[^/]+$/)) {
      return await deleteCat(event);
    } else {
      return response(404, { error: 'Not found', path, method });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};