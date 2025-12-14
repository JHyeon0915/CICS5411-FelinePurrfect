# infra/main.tf

# Generate random suffix for globally unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

locals {
  account_id = data.aws_caller_identity.current.account_id
  region     = data.aws_region.current.name

  # Resource naming
  name_prefix = "${var.project_name}-${var.environment}"

  # Unique bucket names (S3 buckets must be globally unique)
  cat_photos_bucket_name = "${local.name_prefix}-cat-photos-${random_string.suffix.result}"
  backups_bucket_name    = "${local.name_prefix}-backups-${random_string.suffix.result}"
  ml_data_bucket_name    = "${local.name_prefix}-ml-data-${random_string.suffix.result}"
}

# ========================================
# COGNITO USER POOL
# ========================================

module "cognito" {
  source = "./modules/cognito"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

# ========================================
# STANDALONE AUTH LAMBDA (COGNITO)
# ========================================

resource "aws_lambda_function" "auth" {
  filename         = "${path.module}/lambda-functions/dist/auth.zip"
  function_name    = "${var.project_name}-${var.environment}-auth"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/lambda-functions/dist/auth.zip")
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      COGNITO_USER_POOL_ID = module.cognito.user_pool_id
      COGNITO_CLIENT_ID    = module.cognito.app_client_id
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-auth-lambda"
    Environment = var.environment
  }
}

# Lambda CloudWatch Log Group for Auth
resource "aws_cloudwatch_log_group" "auth_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.auth.function_name}"
  retention_in_days = 30

  tags = {
    Name        = "${var.project_name}-auth-logs"
    Environment = var.environment
  }
}

# Lambda Permission for API Gateway to invoke Auth Lambda
resource "aws_lambda_permission" "auth_invoke" {
  statement_id  = "AllowAPIGatewayInvokeAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.api_gateway.api_execution_arn}/*/*"
}

# ========================================
# API GATEWAY
# ========================================

module "api_gateway" {
  source = "./modules/api-gateway"

  name_prefix = local.name_prefix
  stage_name  = var.environment
  aws_region     = var.aws_region
  
  # Standalone Auth Lambda (Cognito)
  lambda_auth_invoke_arn = aws_lambda_function.auth.invoke_arn
  lambda_auth_name       = aws_lambda_function.auth.function_name

  # Cognito for JWT Authorizer
  cognito_user_pool_id   = module.cognito.user_pool_id
  cognito_app_client_id  = module.cognito.app_client_id
  
  # Other Lambdas from lambda module
  lambda_cats_invoke_arn      = module.lambda.cats_invoke_arn
  lambda_cats_name            = module.lambda.cats_function_name
  lambda_logs_invoke_arn      = module.lambda.logs_invoke_arn
  lambda_logs_name            = module.lambda.logs_function_name
  lambda_dashboard_invoke_arn = module.lambda.dashboard_analysis_invoke_arn
  lambda_dashboard_name       = module.lambda.dashboard_analysis_function_name
  lambda_diseases_invoke_arn  = module.lambda.diseases_invoke_arn
  lambda_diseases_name        = module.lambda.diseases_function_name
}

# ========================================
# DYNAMODB MODULE
# ========================================

module "dynamodb" {
  source = "./modules/dynamodb"

  name_prefix = local.name_prefix
  environment = var.environment
}

# ========================================
# S3 MODULE
# ========================================

module "s3" {
  source = "./modules/s3"

  cat_photos_bucket_name = local.cat_photos_bucket_name
  backups_bucket_name    = local.backups_bucket_name
  ml_data_bucket_name    = local.ml_data_bucket_name
  environment            = var.environment
}

# ========================================
# LAMBDA MODULE (Business Logic Lambdas)
# ========================================

module "lambda" {
  source = "./modules/lambda"

  name_prefix              = local.name_prefix
  environment              = var.environment
  lab_role_arn             = var.lab_role_arn
  aws_region               = var.aws_region

  users_table_name         = module.dynamodb.users_table_name
  cats_table_name          = module.dynamodb.cats_table_name
  logs_table_name          = module.dynamodb.logs_table_name
  diseases_table_name      = module.dynamodb.diseases_table_name
  device_tokens_table_name = module.dynamodb.device_tokens_table_name

  cat_photos_bucket_name   = module.s3.cat_photos_bucket_name

  sns_topic_arn            = module.sns.reminders_topic_arn
}

# ========================================
# SNS MODULE
# ========================================

module "sns" {
  source = "./modules/sns"

  name_prefix = local.name_prefix
  owner_email = var.owner_email
}

# ========================================
# EVENTBRIDGE MODULE
# ========================================

module "eventbridge" {
  source = "./modules/eventbridge"

  name_prefix                      = local.name_prefix
  check_missing_logs_lambda_arn    = module.lambda.check_missing_logs_function_arn
  check_missing_logs_function_name = module.lambda.check_missing_logs_function_name
}

# ========================================
# WAF MODULE
# ========================================

module "waf" {
  source = "./modules/waf"

  name_prefix = local.name_prefix
}

# ========================================
# CLOUDWATCH MODULE
# ========================================

module "cloudwatch" {
  source = "./modules/cloudwatch"

  name_prefix           = local.name_prefix
  api_gateway_name      = module.api_gateway.api_gateway_name
  lambda_function_names = module.lambda.all_function_names
  sns_alarm_topic_arn   = module.sns.system_alerts_topic_arn
  budget_threshold      = var.budget_alert_threshold
}

# ========================================
# SAGEMAKER MODULE (commented out for now)
# ========================================

# module "sagemaker" {
#   source = "./modules/sagemaker"
#
#   name_prefix        = local.name_prefix
#   ml_data_bucket_arn = module.s3.ml_data_bucket_arn
# }
