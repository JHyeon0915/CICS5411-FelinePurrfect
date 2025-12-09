const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

const CATS_TABLE = process.env.CATS_TABLE;
const LOGS_TABLE = process.env.LOGS_TABLE;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

exports.handler = async (event) => {
  console.log('Checking for missing logs...');

  try {
    // Get all cats
    const scanCommand = new ScanCommand({
      TableName: CATS_TABLE
    });

    const catsResult = await docClient.send(scanCommand);
    const cats = catsResult.Items || [];

    const today = new Date().toISOString().split('T')[0];
    const missingLogs = [];

    for (const cat of cats) {
      // Check if there's a log for today
      const queryCommand = new QueryCommand({
        TableName: LOGS_TABLE,
        IndexName: 'CatIdIndex',
        KeyConditionExpression: 'catId = :catId',
        FilterExpression: '#date = :today',
        ExpressionAttributeNames: {
          '#date': 'date'
        },
        ExpressionAttributeValues: {
          ':catId': cat.catId,
          ':today': today
        }
      });

      const logsResult = await docClient.send(queryCommand);

      if (!logsResult.Items || logsResult.Items.length === 0) {
        missingLogs.push({
          catName: cat.name,
          userId: cat.userId,
          catId: cat.catId
        });
      }
    }

    // Send notifications for missing logs
    if (missingLogs.length > 0) {
      const message = `Reminder: You haven't logged health data for the following cats today:\n${
        missingLogs.map(log => `- ${log.catName}`).join('\n')
      }`;

      const publishCommand = new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'Daily Health Log Reminder',
        Message: message
      });

      await snsClient.send(publishCommand);

      console.log(`Sent reminders for ${missingLogs.length} cats`);
    } else {
      console.log('All cats have logs for today');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Check completed',
        missingLogs: missingLogs.length
      })
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};