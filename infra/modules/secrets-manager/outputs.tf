output "jwt_secret_arn" {
  description = "JWT secret ARN"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "db_encryption_key_arn" {
  description = "Database encryption key ARN"
  value       = aws_secretsmanager_secret.db_encryption_key.arn
}

output "sns_api_keys_arn" {
  description = "SNS API keys ARN"
  value       = aws_secretsmanager_secret.sns_api_keys.arn
}