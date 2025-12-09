output "api_gateway_url" {
  description = "API Gateway invoke URL"
  value       = module.api_gateway.api_invoke_url
}

output "cat_photos_bucket_name" {
  description = "S3 bucket for cat photos"
  value       = module.s3.cat_photos_bucket_name
}

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

output "sns_topic_arns" {
  description = "SNS topic ARNs"
  value = {
    reminders     = module.sns.reminders_topic_arn
    system_alerts = module.sns.system_alerts_topic_arn
  }
}

output "jwt_secret_arn" {
  description = "JWT secret ARN in Secrets Manager"
  value       = module.secrets_manager.jwt_secret_arn
  sensitive   = true
}