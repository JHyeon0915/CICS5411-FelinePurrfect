const { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, ChangePasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

// Response helper
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

// Sign Up
async function signUp(body) {
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email, password, and name are required' 
    });
  }

  try {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name }
      ]
    });

    await cognitoClient.send(command);

    return response(201, {
      message: 'User registered successfully. Please check your email for verification code.'
    });
  } catch (error) {
    console.error('SignUp error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Confirm Sign Up (Email Verification)
async function confirmSignUp(body) {
  const { email, code } = body;

  if (!email || !code) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email and verification code are required' 
    });
  }

  try {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code
    });

    await cognitoClient.send(command);

    return response(200, {
      message: 'Email verified successfully. You can now sign in.'
    });
  } catch (error) {
    console.error('ConfirmSignUp error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Resend Confirmation Code
async function resendCode(body) {
  const { email } = body;

  if (!email) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email is required' 
    });
  }

  try {
    const command = new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: email
    });

    await cognitoClient.send(command);

    return response(200, {
      message: 'Verification code resent successfully'
    });
  } catch (error) {
    console.error('ResendCode error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Sign In
async function signIn(body) {
  const { email, password } = body;

  if (!email || !password) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email and password are required' 
    });
  }

  try {
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });

    const result = await cognitoClient.send(command);

    // Decode JWT to get user info (without verification - just parsing)
    const idToken = result.AuthenticationResult.IdToken;
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());

    return response(200, {
      message: 'Login successful',
      token: result.AuthenticationResult.IdToken,
      refreshToken: result.AuthenticationResult.RefreshToken,
      expiresIn: result.AuthenticationResult.ExpiresIn,
      user: {
        userId: payload.sub,
        email: payload.email,
        name: payload.name
      }
    });
  } catch (error) {
    console.error('SignIn error:', error);
    return response(401, {
      code: error.name,
      message: 'Invalid email or password'
    });
  }
}

// Forgot Password
async function forgotPassword(body) {
  const { email } = body;

  if (!email) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email is required' 
    });
  }

  try {
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email
    });

    await cognitoClient.send(command);

    return response(200, {
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Confirm Forgot Password (Reset Password)
async function resetPassword(body) {
  const { email, code, newPassword } = body;

  if (!email || !code || !newPassword) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Email, code, and new password are required' 
    });
  }

  try {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    });

    await cognitoClient.send(command);

    return response(200, {
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('ResetPassword error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Change Password (for authenticated users)
async function changePassword(body, accessToken) {
  const { oldPassword, newPassword } = body;

  if (!oldPassword || !newPassword) {
    return response(400, { 
      code: 'ValidationError',
      message: 'Old password and new password are required' 
    });
  }

  if (!accessToken) {
    return response(401, {
      code: 'Unauthorized',
      message: 'Access token is required'
    });
  }

  try {
    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword
    });

    await cognitoClient.send(command);

    return response(200, {
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('ChangePassword error:', error);
    return response(400, {
      code: error.name,
      message: error.message
    });
  }
}

// Main handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext.http.method === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const path = event.rawPath || event.path;
    const body = JSON.parse(event.body || '{}');
    
    // Get access token from Authorization header
    const authHeader = event.headers?.authorization || event.headers?.Authorization;
    const accessToken = authHeader?.replace('Bearer ', '');

    switch (path) {
      case '/auth/signup':
        return await signUp(body);
      
      case '/auth/verify':
        return await confirmSignUp(body);
      
      case '/auth/resend-code':
        return await resendCode(body);
      
      case '/auth/signin':
        return await signIn(body);
      
      case '/auth/forgot-password':
        return await forgotPassword(body);
      
      case '/auth/reset-password':
        return await resetPassword(body);
      
      case '/auth/change-password':
        return await changePassword(body, accessToken);
      
      default:
        return response(404, { 
          code: 'NotFound',
          message: 'Endpoint not found' 
        });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return response(500, { 
      code: 'InternalServerError',
      message: error.message 
    });
  }
};