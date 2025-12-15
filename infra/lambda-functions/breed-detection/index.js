const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');

const sagemakerClient = new SageMakerRuntimeClient({ region: process.env.AWS_REGION });

const SAGEMAKER_ENDPOINT = process.env.SAGEMAKER_ENDPOINT_NAME;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'POST,OPTIONS'
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

/**
 * Detect cat breed from base64 image
 */
async function detectBreed(event) {
  const userId = getUserId(event);
  
  if (!userId) {
    return response(401, { error: 'Unauthorized' });
  }
  
  const body = JSON.parse(event.body || '{}');
  const { image } = body; // Base64 encoded image

  if (!image) {
    return response(400, { error: 'Image is required' });
  }

  console.log('Detecting breed for user:', userId);
  console.log('Image size:', image.length, 'characters');

  try {
    // Prepare payload for SageMaker
    const payload = JSON.stringify({ image });

    // Invoke SageMaker endpoint
    const command = new InvokeEndpointCommand({
      EndpointName: SAGEMAKER_ENDPOINT,
      ContentType: 'application/json',
      Accept: 'application/json',
      Body: payload
    });

    console.log('Invoking SageMaker endpoint:', SAGEMAKER_ENDPOINT);
    
    const sagemakerResponse = await sagemakerClient.send(command);
    
    // Parse SageMaker response
    const responseBody = JSON.parse(
      new TextDecoder().decode(sagemakerResponse.Body)
    );

    console.log('SageMaker response:', JSON.stringify(responseBody, null, 2));

    return response(200, {
      breed: responseBody.top_breed,
      confidence: responseBody.confidence,
      allPredictions: responseBody.predictions
    });

  } catch (error) {
    console.error('Error detecting breed:', error);
    
    // If SageMaker endpoint is not available, return a fallback
    if (error.name === 'ValidationException' || error.name === 'ServiceUnavailableException') {
      console.log('SageMaker endpoint unavailable, using fallback');
      return response(200, {
        breed: 'Domestic Short Hair',
        confidence: 0.5,
        allPredictions: [
          { breed: 'Domestic Short Hair', confidence: 0.5 },
          { breed: 'Mixed Breed', confidence: 0.3 },
          { breed: 'Tabby', confidence: 0.2 }
        ],
        fallback: true,
        message: 'Breed detection service temporarily unavailable. Using default breed.'
      });
    }

    return response(500, { 
      error: 'Failed to detect breed', 
      message: error.message 
    });
  }
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

    if (method === 'POST' && path === '/detect-breed') {
      return await detectBreed(event);
    } else {
      return response(404, { error: 'Not found', path, method });
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};