# infra/modules/api-gateway/main.tf

# API Gateway HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }
  
  tags = {
    Name = "${var.name_prefix}-api-gateway"
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.stage_name
  auto_deploy = true
  
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
  
  tags = {
    Name = "${var.name_prefix}-api-stage"
  }
}

# Cognito JWT Authorizer
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.name_prefix}-cognito-authorizer"

  jwt_configuration {
    audience = [var.cognito_app_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}-api"
  retention_in_days = 30
}

# ========================================
# AUTH LAMBDA INTEGRATION & ROUTES
# ========================================

resource "aws_apigatewayv2_integration" "auth" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_auth_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "register" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/register"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "login" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/login"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "verify" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/verify"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "resend_code" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/resend-code"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "forgot_password" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/forgot-password"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "reset_password" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/reset-password"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "change_password" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /auth/change-password"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "update_profile" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /auth/update-profile"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "delete_account" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /auth/delete-account"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_lambda_permission" "auth" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_auth_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# ========================================
# CATS LAMBDA INTEGRATION & ROUTES
# ========================================

resource "aws_apigatewayv2_integration" "cats" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_cats_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_cats" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /cats"
  target    = "integrations/${aws_apigatewayv2_integration.cats.id}"

  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "create_cat" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /cats"
  target    = "integrations/${aws_apigatewayv2_integration.cats.id}"
    
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "get_cat" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /cats/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.cats.id}"
    
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "update_cat" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /cats/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.cats.id}"
    
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_route" "delete_cat" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /cats/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.cats.id}"
    
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

# Lambda Permission for Cats
resource "aws_lambda_permission" "cats" {
  statement_id  = "AllowAPIGatewayInvokeCats"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_cats_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# ========================================
# LOGS LAMBDA INTEGRATION & ROUTES
# ========================================

resource "aws_apigatewayv2_integration" "logs" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_logs_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_logs" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /logs"
  target    = "integrations/${aws_apigatewayv2_integration.logs.id}"
}

resource "aws_apigatewayv2_route" "create_log" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /logs"
  target    = "integrations/${aws_apigatewayv2_integration.logs.id}"
}

resource "aws_apigatewayv2_route" "get_log" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /logs/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.logs.id}"
}

resource "aws_apigatewayv2_route" "update_log" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /logs/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.logs.id}"
}

resource "aws_apigatewayv2_route" "delete_log" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "DELETE /logs/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.logs.id}"
}

resource "aws_lambda_permission" "logs" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_logs_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# ========================================
# DASHBOARD LAMBDA INTEGRATION & ROUTES
# ========================================

resource "aws_apigatewayv2_integration" "dashboard" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_dashboard_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "dashboard_analysis" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /dashboard/analysis"
  target    = "integrations/${aws_apigatewayv2_integration.dashboard.id}"
}

resource "aws_lambda_permission" "dashboard" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_dashboard_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# ========================================
# DISEASES LAMBDA INTEGRATION & ROUTES
# ========================================

resource "aws_apigatewayv2_integration" "diseases" {
  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "AWS_PROXY"
  integration_uri    = var.lambda_diseases_invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_diseases" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /diseases"
  target    = "integrations/${aws_apigatewayv2_integration.diseases.id}"
}

resource "aws_apigatewayv2_route" "search_diseases" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /diseases/search"
  target    = "integrations/${aws_apigatewayv2_integration.diseases.id}"
}

resource "aws_apigatewayv2_route" "get_disease" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /diseases/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.diseases.id}"
}

resource "aws_lambda_permission" "diseases" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_diseases_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
