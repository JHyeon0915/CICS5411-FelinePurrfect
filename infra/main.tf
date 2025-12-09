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

# DynamoDB Module
module "dynamodb" {
  source = "./modules/dynamodb"

  name_prefix = local.name_prefix
  environment = var.environment
}

# S3 Module
module "s3" {
  source = "./modules/s3"

  cat_photos_bucket_name = local.cat_photos_bucket_name
  backups_bucket_name    = local.backups_bucket_name
  ml_data_bucket_name    = local.ml_data_bucket_name
  environment            = var.environment
}

# Secrets Manager Module
module "secrets_manager" {
  source = "./modules/secrets-manager"

  name_prefix       = local.name_prefix
  jwt_secret_length = var.jwt_secret_length
}

# Lambda Module
module "lambda" {
  source = "./modules/lambda"

  name_prefix              = local.name_prefix
  environment              = var.environment
  users_table_name         = module.dynamodb.users_table_name
  cats_table_name          = module.dynamodb.cats_table_name
  logs_table_name          = module.dynamodb.logs_table_name
  diseases_table_name      = module.dynamodb.diseases_table_name
  device_tokens_table_name = module.dynamodb.device_tokens_table_name
  cat_photos_bucket_name   = module.s3.cat_photos_bucket_name
  jwt_secret_arn           = module.secrets_manager.jwt_secret_arn
  sns_topic_arn            = module.sns.reminders_topic_arn
}

# API Gateway Module
module "api_gateway" {
  source = "./modules/api-gateway"

  name_prefix                  = local.name_prefix
  lambda_auth_arn              = module.lambda.auth_function_arn
  lambda_cats_arn              = module.lambda.cats_function_arn
  lambda_logs_arn              = module.lambda.logs_function_arn
  lambda_dashboard_arn         = module.lambda.dashboard_analysis_function_arn
  lambda_authorizer_arn        = module.lambda.authorizer_function_arn
  lambda_authorizer_invoke_arn = module.lambda.authorizer_invoke_arn
}

# SNS Module
module "sns" {
  source = "./modules/sns"

  name_prefix = local.name_prefix
  owner_email = var.owner_email # REPLACE IN terraform.tfvars
}

# EventBridge Module
module "eventbridge" {
  source = "./modules/eventbridge"

  name_prefix                      = local.name_prefix
  check_missing_logs_lambda_arn    = module.lambda.check_missing_logs_function_arn
  check_missing_logs_function_name = module.lambda.check_missing_logs_function_name
}

# WAF Module
module "waf" {
  source = "./modules/waf"

  name_prefix = local.name_prefix
}

# CloudWatch Module
module "cloudwatch" {
  source = "./modules/cloudwatch"

  name_prefix           = local.name_prefix
  api_gateway_name      = module.api_gateway.api_gateway_name
  lambda_function_names = module.lambda.all_function_names
  sns_alarm_topic_arn   = module.sns.system_alerts_topic_arn
  budget_threshold      = var.budget_alert_threshold
}

# SageMaker Module
# module "sagemaker" {
#   source = "./modules/sagemaker"

#   name_prefix        = local.name_prefix
#   ml_data_bucket_arn = module.s3.ml_data_bucket_arn
# }