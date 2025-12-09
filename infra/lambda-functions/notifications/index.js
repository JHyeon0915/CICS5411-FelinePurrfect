const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // This function can be triggered by various events
    // For now, it's a placeholder for push notifications
    
    const { phoneNumber, message, subject } = event;

    if (!phoneNumber || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Phone number and message are required' })
      };
    }

    const publishCommand = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message,
      Subject: subject || 'Feline Purrfect Notification'
    });

    const result = await snsClient.send(publishCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification sent',
        messageId: result.MessageId
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send notification', message: error.message })
    };
  }
};