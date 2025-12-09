output "users_table_name" {
  description = "Users table name"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "Users table ARN"
  value       = aws_dynamodb_table.users.arn
}

output "cats_table_name" {
  description = "Cats table name"
  value       = aws_dynamodb_table.cats.name
}

output "cats_table_arn" {
  description = "Cats table ARN"
  value       = aws_dynamodb_table.cats.arn
}

output "logs_table_name" {
  description = "Logs table name"
  value       = aws_dynamodb_table.logs.name
}

output "logs_table_arn" {
  description = "Logs table ARN"
  value       = aws_dynamodb_table.logs.arn
}

output "diseases_table_name" {
  description = "Diseases table name"
  value       = aws_dynamodb_table.diseases.name
}

output "diseases_table_arn" {
  description = "Diseases table ARN"
  value       = aws_dynamodb_table.diseases.arn
}

output "device_tokens_table_name" {
  description = "Device tokens table name"
  value       = aws_dynamodb_table.device_tokens.name
}

output "device_tokens_table_arn" {
  description = "Device tokens table ARN"
  value       = aws_dynamodb_table.device_tokens.arn
}