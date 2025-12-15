const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const DISEASES_TABLE = process.env.DISEASES_TABLE_NAME;

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

// Get all diseases (with optional search)
async function getDiseases(event) {
  const searchQuery = event.queryStringParameters?.search?.toLowerCase();
  const category = event.queryStringParameters?.category;

  const scanCommand = new ScanCommand({
    TableName: DISEASES_TABLE
  });

  const result = await docClient.send(scanCommand);
  let diseases = result.Items || [];

  // Filter by search query (name, symptoms, description)
  if (searchQuery) {
    diseases = diseases.filter(disease => {
      const nameMatch = disease.name.toLowerCase().includes(searchQuery);
      const symptomsMatch = disease.symptoms?.some(s => 
        s.toLowerCase().includes(searchQuery)
      );
      const descMatch = disease.description?.toLowerCase().includes(searchQuery);
      const categoryMatch = disease.category?.toLowerCase().includes(searchQuery);
      
      return nameMatch || symptomsMatch || descMatch || categoryMatch;
    });
  }

  // Filter by category
  if (category) {
    diseases = diseases.filter(disease => 
      disease.category?.toLowerCase() === category.toLowerCase()
    );
  }

  // Sort by name
  diseases.sort((a, b) => a.name.localeCompare(b.name));

  // Map diseaseId to id for frontend
  const diseasesWithId = diseases.map(disease => ({
    ...disease,
    id: disease.diseaseId
  }));

  return response(200, { diseases: diseasesWithId });
}

// Get single disease
async function getDisease(event) {
  const diseaseId = event.pathParameters?.id;

  if (!diseaseId) {
    return response(400, { error: 'Disease ID is required' });
  }

  const getCommand = new GetCommand({
    TableName: DISEASES_TABLE,
    Key: { diseaseId }
  });

  const result = await docClient.send(getCommand);

  if (!result.Item) {
    return response(404, { error: 'Disease not found' });
  }

  return response(200, { 
    disease: { ...result.Item, id: result.Item.diseaseId }
  });
}

// Seed diseases (admin only - for initial setup)
async function seedDiseases(event) {
  const { diseases } = require('./diseaseData.js');

  const items = diseases.map(disease => ({
    PutRequest: {
      Item: {
        diseaseId: uuidv4(),
        ...disease,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }));

  // DynamoDB batch write limit is 25 items
  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    const batchCommand = new BatchWriteCommand({
      RequestItems: {
        [DISEASES_TABLE]: chunk
      }
    });
    await docClient.send(batchCommand);
  }

  return response(201, { 
    message: `Successfully seeded ${diseases.length} diseases` 
  });
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

    if (method === 'GET' && path === '/diseases') {
      return await getDiseases(event);
    } else if (method === 'GET' && path.match(/^\/diseases\/[^/]+$/)) {
      return await getDisease(event);
    } else if (method === 'POST' && path === '/diseases/seed') {
      return await seedDiseases(event);
    } else {
      return response(404, { error: 'Not found', path, method });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};