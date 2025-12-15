const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION });

const CATS_TABLE = process.env.CATS_TABLE_NAME;
const LOGS_TABLE = process.env.LOGS_TABLE_NAME;
const DEVICE_TOKENS_TABLE = process.env.DEVICE_TOKENS_TABLE_NAME;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

/**
 * Check for missing daily logs and send reminders
 * Triggered by EventBridge at 11:30 PM UTC daily
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Starting missing logs check...');

  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for logs on date: ${today}`);

    // Get all cats from the database
    const scanCommand = new ScanCommand({
      TableName: CATS_TABLE
    });

    const catsResult = await docClient.send(scanCommand);
    const cats = catsResult.Items || [];
    console.log(`Found ${cats.length} total cats`);

    if (cats.length === 0) {
      console.log('No cats in database');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No cats to check' })
      };
    }

    // Group cats by userId
    const catsByUser = {};
    for (const cat of cats) {
      if (!catsByUser[cat.userId]) {
        catsByUser[cat.userId] = [];
      }
      catsByUser[cat.userId].push(cat);
    }

    console.log(`Checking logs for ${Object.keys(catsByUser).length} users`);

    const notificationsSent = [];

    // Check each user's cats
    for (const [userId, userCats] of Object.entries(catsByUser)) {
      const missingLogs = [];

      for (const cat of userCats) {
        // Check if there's a log for today
        const queryCommand = new QueryCommand({
          TableName: LOGS_TABLE,
          KeyConditionExpression: 'catId = :catId AND #date = :today',
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
            catId: cat.catId
          });
        }
      }

      // Send notification if user has missing logs
      if (missingLogs.length > 0) {
        console.log(`User ${userId} has ${missingLogs.length} cats without logs`);

        const message = buildNotificationMessage(missingLogs, userCats.length);
        
        try {
          // Send SNS notification
          const publishCommand = new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: '🐱 Daily Health Log Reminder',
            Message: message,
            MessageAttributes: {
              userId: {
                DataType: 'String',
                StringValue: userId
              },
              missingCount: {
                DataType: 'Number',
                StringValue: missingLogs.length.toString()
              }
            }
          });

          const result = await snsClient.send(publishCommand);
          
          notificationsSent.push({
            userId,
            missingCount: missingLogs.length,
            totalCats: userCats.length,
            messageId: result.MessageId
          });

          console.log(`Sent notification to user ${userId}, MessageId: ${result.MessageId}`);
        } catch (error) {
          console.error(`Failed to send notification to user ${userId}:`, error);
        }
      } else {
        console.log(`User ${userId} has logged all ${userCats.length} cats today ✓`);
      }
    }

    const summary = {
      totalCats: cats.length,
      totalUsers: Object.keys(catsByUser).length,
      notificationsSent: notificationsSent.length,
      checkDate: today,
      timestamp: new Date().toISOString()
    };

    console.log('Check completed:', JSON.stringify(summary, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Missing logs check completed',
        summary,
        notifications: notificationsSent
      })
    };

  } catch (error) {
    console.error('Error checking missing logs:', error);
    
    // Send error alert to system alerts topic
    try {
      const alertCommand = new PublishCommand({
        TopicArn: SNS_TOPIC_ARN,
        Subject: '⚠️ Error in Daily Reminder System',
        Message: `Error occurred while checking missing logs:\n\n${error.message}\n\nStack:\n${error.stack}`
      });
      await snsClient.send(alertCommand);
    } catch (alertError) {
      console.error('Failed to send error alert:', alertError);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to check missing logs',
        message: error.message
      })
    };
  }
};

/**
 * Build a friendly notification message
 */
function buildNotificationMessage(missingLogs, totalCats) {
  const catNames = missingLogs.map(log => `• ${log.catName}`).join('\n');
  
  if (missingLogs.length === 1) {
    return `🐱 Daily Health Log Reminder\n\nYou haven't logged health data for ${missingLogs[0].catName} today.\n\nTap to open the app and log their daily activities!`;
  } else if (missingLogs.length === totalCats) {
    return `🐱 Daily Health Log Reminder\n\nYou haven't logged health data for any of your cats today:\n\n${catNames}\n\nTap to open the app and log their daily activities!`;
  } else {
    return `🐱 Daily Health Log Reminder\n\nYou haven't logged health data for ${missingLogs.length} of your cats today:\n\n${catNames}\n\nTap to open the app and complete today's logs!`;
  }
}