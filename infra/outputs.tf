# infra/outputs.tf
# Root-level outputs

# ========================================
# COGNITO OUTPUTS
# ========================================

output "cognito_user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_user_pool_arn" {
  description = "The ARN of the Cognito User Pool"
  value       = module.cognito.user_pool_arn
}

output "cognito_app_client_id" {
  description = "The ID of the Cognito App Client"
  value       = module.cognito.app_client_id
}

output "cognito_region" {
  description = "AWS region where Cognito is deployed"
  value       = var.aws_region
}

# ========================================
# API GATEWAY OUTPUTS
# ========================================

output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.api_gateway.api_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.api_gateway.api_id
}

# ========================================
# AUTH LAMBDA OUTPUTS
# ========================================

output "auth_lambda_name" {
  description = "Auth Lambda function name"
  value       = aws_lambda_function.auth.function_name
}

output "auth_lambda_arn" {
  description = "Auth Lambda function ARN"
  value       = aws_lambda_function.auth.arn
}

# ========================================
# DYNAMODB OUTPUTS
# ========================================

output "dynamodb_table_names" {
  description = "DynamoDB table names"
  value = {
    users         = module.dynamodb.users_table_name
    cats          = module.dynamodb.cats_table_name
    logs          = module.dynamodb.logs_table_name
    diseases      = module.dynamodb.diseases_table_name
    device_tokens = module.dynamodb.device_tokens_table_name
  }
}

# ========================================
# S3 OUTPUTS
# ========================================

output "cat_photos_bucket_name" {
  description = "S3 bucket name for cat photos"
  value       = module.s3.cat_photos_bucket_name
}

# ========================================
# SNS OUTPUTS
# ========================================

output "sns_topic_arns" {
  description = "SNS topic ARNs"
  value = {
    reminders     = module.sns.reminders_topic_arn
    system_alerts = module.sns.system_alerts_topic_arn
  }
}

# ========================================
# FORMATTED OUTPUT FOR .ENV FILE
# ========================================

output "frontend_env_variables" {
  description = "Environment variables for React Native frontend"
  value = <<-EOT
    
    ✅ Copy these to frontend/.env:
    
    EXPO_PUBLIC_AWS_REGION=${var.aws_region}
    EXPO_PUBLIC_COGNITO_USER_POOL_ID=${module.cognito.user_pool_id}
    EXPO_PUBLIC_COGNITO_CLIENT_ID=${module.cognito.app_client_id}
    EXPO_PUBLIC_AUTH_API_URL=${module.api_gateway.api_url}
    EXPO_PUBLIC_API_BASE_URL=${module.api_gateway.api_url}
    
    📝 Auth Lambda: ${aws_lambda_function.auth.function_name}
    📝 API Gateway: ${module.api_gateway.api_url}
  EOT
}
