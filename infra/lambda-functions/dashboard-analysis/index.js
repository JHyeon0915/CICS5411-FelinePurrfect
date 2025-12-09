const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CATS_TABLE = process.env.CATS_TABLE;
const LOGS_TABLE = process.env.LOGS_TABLE;

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

// Calculate health trends
function analyzeLogs(logs) {
  if (!logs || logs.length === 0) {
    return {
      averageWeight: null,
      averageTemperature: null,
      appetiteTrend: null,
      energyTrend: null,
      healthIssues: []
    };
  }

  const weights = logs.filter(l => l.weight).map(l => l.weight);
  const temperatures = logs.filter(l => l.temperature).map(l => l.temperature);
  
  const averageWeight = weights.length > 0 
    ? weights.reduce((a, b) => a + b, 0) / weights.length 
    : null;
  
  const averageTemperature = temperatures.length > 0 
    ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length 
    : null;

  // Analyze recent trends (last 7 days)
  const recentLogs = logs.slice(0, 7);
  const appetiteValues = recentLogs.filter(l => l.appetite).map(l => l.appetite);
  const energyValues = recentLogs.filter(l => l.energy).map(l => l.energy);

  const appetiteTrend = appetiteValues.length > 0
    ? appetiteValues.reduce((a, b) => a + b, 0) / appetiteValues.length
    : null;

  const energyTrend = energyValues.length > 0
    ? energyValues.reduce((a, b) => a + b, 0) / energyValues.length
    : null;

  // Identify health issues
  const healthIssues = [];
  const recentIssues = recentLogs.slice(0, 3);

  const vomitingCount = recentIssues.filter(l => l.vomiting).length;
  const diarrheaCount = recentIssues.filter(l => l.diarrhea).length;

  if (vomitingCount >= 2) {
    healthIssues.push('Frequent vomiting detected in recent logs');
  }
  if (diarrheaCount >= 2) {
    healthIssues.push('Frequent diarrhea detected in recent logs');
  }
  if (averageTemperature && (averageTemperature < 37.5 || averageTemperature > 39.5)) {
    healthIssues.push('Temperature outside normal range (37.5-39.5°C)');
  }
  if (appetiteTrend && appetiteTrend < 3) {
    healthIssues.push('Low appetite trend detected');
  }
  if (energyTrend && energyTrend < 3) {
    healthIssues.push('Low energy trend detected');
  }

  return {
    averageWeight: averageWeight ? averageWeight.toFixed(2) : null,
    averageTemperature: averageTemperature ? averageTemperature.toFixed(1) : null,
    appetiteTrend: appetiteTrend ? appetiteTrend.toFixed(1) : null,
    energyTrend: energyTrend ? energyTrend.toFixed(1) : null,
    healthIssues,
    totalLogs: logs.length
  };
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const userId = getUserId(event);

    // Get all cats for user
    const catsQuery = new QueryCommand({
      TableName: CATS_TABLE,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const catsResult = await docClient.send(catsQuery);
    const cats = catsResult.Items || [];

    // Get analysis for each cat
    const analysis = await Promise.all(cats.map(async (cat) => {
      const logsQuery = new QueryCommand({
        TableName: LOGS_TABLE,
        IndexName: 'CatIdIndex',
        KeyConditionExpression: 'catId = :catId',
        ExpressionAttributeValues: {
          ':catId': cat.catId
        },
        ScanIndexForward: false,
        Limit: 30 // Last 30 logs
      });

      const logsResult = await docClient.send(logsQuery);
      const logs = logsResult.Items || [];

      return {
        catId: cat.catId,
        catName: cat.name,
        breed: cat.breed,
        ...analyzeLogs(logs)
      };
    }));

    return response(200, {
      totalCats: cats.length,
      analysis
    });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};