const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CATS_TABLE = process.env.CATS_TABLE_NAME;
const LOGS_TABLE = process.env.LOGS_TABLE_NAME;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function getUserId(event) {
  const claims = event.requestContext?.authorizer?.jwt?.claims;
  if (claims) {
    return claims.sub || claims['cognito:username'];
  }
  return event.requestContext?.authorizer?.userId;
}

// Calculate comprehensive health trends
function analyzeLogs(logs) {
  if (!logs || logs.length === 0) {
    return {
      averageWeight: null,
      averageTemperature: null,
      appetiteTrend: null,
      energyTrend: null,
      averagePooCount: null,
      averagePeeCount: null,
      averageFoodCount: null,
      averageWaterCount: null,
      healthIssues: [],
      totalLogs: 0
    };
  }

  // Calculate averages
  const weights = logs.filter(l => l.weight).map(l => l.weight);
  const temperatures = logs.filter(l => l.temperature).map(l => l.temperature);
  const pooCounts = logs.filter(l => l.pooCount).map(l => l.pooCount);
  const peeCounts = logs.filter(l => l.peeCount).map(l => l.peeCount);
  const foodCounts = logs.filter(l => l.foodCount).map(l => l.foodCount);
  const waterCounts = logs.filter(l => l.waterCount).map(l => l.waterCount);
  
  const averageWeight = weights.length > 0 
    ? weights.reduce((a, b) => a + b, 0) / weights.length 
    : null;
  
  const averageTemperature = temperatures.length > 0 
    ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length 
    : null;

  const averagePooCount = pooCounts.length > 0
    ? pooCounts.reduce((a, b) => a + b, 0) / pooCounts.length
    : null;

  const averagePeeCount = peeCounts.length > 0
    ? peeCounts.reduce((a, b) => a + b, 0) / peeCounts.length
    : null;

  const averageFoodCount = foodCounts.length > 0
    ? foodCounts.reduce((a, b) => a + b, 0) / foodCounts.length
    : null;

  const averageWaterCount = waterCounts.length > 0
    ? waterCounts.reduce((a, b) => a + b, 0) / waterCounts.length
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
  if (averagePooCount && averagePooCount < 1) {
    healthIssues.push('Low bowel movement frequency detected');
  }
  if (averagePooCount && averagePooCount > 4) {
    healthIssues.push('High bowel movement frequency detected');
  }
  if (averageWaterCount && averageWaterCount < 2) {
    healthIssues.push('Low water intake detected');
  }

  return {
    averageWeight: averageWeight ? averageWeight.toFixed(2) : null,
    averageTemperature: averageTemperature ? averageTemperature.toFixed(1) : null,
    appetiteTrend: appetiteTrend ? appetiteTrend.toFixed(1) : null,
    energyTrend: energyTrend ? energyTrend.toFixed(1) : null,
    averagePooCount: averagePooCount ? averagePooCount.toFixed(1) : null,
    averagePeeCount: averagePeeCount ? averagePeeCount.toFixed(1) : null,
    averageFoodCount: averageFoodCount ? averageFoodCount.toFixed(1) : null,
    averageWaterCount: averageWaterCount ? averageWaterCount.toFixed(1) : null,
    healthIssues,
    totalLogs: logs.length
  };
}

async function getDashboardAnalytics(event) {
  const userId = getUserId(event);
  
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }

  console.log('Getting analytics for user:', userId);

  const catsQuery = new QueryCommand({
    TableName: CATS_TABLE,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const catsResult = await docClient.send(catsQuery);
  const cats = catsResult.Items || [];

  console.log(`Found ${cats.length} cats for user ${userId}`);

  const analysis = await Promise.all(cats.map(async (cat) => {
    const logsQuery = new QueryCommand({
      TableName: LOGS_TABLE,
      KeyConditionExpression: 'catId = :catId',
      ExpressionAttributeValues: {
        ':catId': cat.catId
      },
      ScanIndexForward: false,
      Limit: 30
    });

    const logsResult = await docClient.send(logsQuery);
    const logs = logsResult.Items || [];

    return {
      catId: cat.catId,
      catName: cat.name,
      breed: cat.breed || 'Unknown',
      ...analyzeLogs(logs)
    };
  }));

  return response(200, {
    totalCats: cats.length,
    analysis
  });
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    let path = event.rawPath || event.path;
    
    if (path.startsWith('/dev/')) {
      path = path.replace('/dev', '');
    } else if (path.startsWith('/prod/')) {
      path = path.replace('/prod', '');
    }

    console.log('Processing:', method, path);

    if (method === 'GET' && path === '/dashboard/analytics') {
      return await getDashboardAnalytics(event);
    } else {
      return response(404, { 
        error: 'Not found', 
        path, 
        method 
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};