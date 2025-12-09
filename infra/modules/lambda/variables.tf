variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "users_table_name" {
  description = "Users DynamoDB table name"
  type        = string
}

variable "cats_table_name" {
  description = "Cats DynamoDB table name"
  type        = string
}

variable "logs_table_name" {
  description = "Logs DynamoDB table name"
  type        = string
}

variable "diseases_table_name" {
  description = "Diseases DynamoDB table name"
  type        = string
}

variable "device_tokens_table_name" {
  description = "Device tokens DynamoDB table name"
  type        = string
}

variable "cat_photos_bucket_name" {
  description = "Cat photos S3 bucket name"
  type        = string
}

variable "jwt_secret_arn" {
  description = "JWT secret ARN"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for notifications"
  type        = string
}