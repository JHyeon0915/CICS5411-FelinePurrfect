variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "lambda_auth_invoke_arn" {
  description = "Invoke ARN of the auth Lambda function"
  type        = string
}

variable "lambda_auth_name" {
  description = "Name of the auth Lambda function"
  type        = string
}

variable "lambda_cats_invoke_arn" {
  description = "Invoke ARN of the cats Lambda function"
  type        = string
}

variable "lambda_cats_name" {
  description = "Name of the cats Lambda function"
  type        = string
}

variable "lambda_logs_invoke_arn" {
  description = "Invoke ARN of the logs Lambda function"
  type        = string
}

variable "lambda_logs_name" {
  description = "Name of the logs Lambda function"
  type        = string
}

variable "lambda_dashboard_invoke_arn" {
  description = "Invoke ARN of the dashboard Lambda function"
  type        = string
}

variable "lambda_dashboard_name" {
  description = "Name of the dashboard Lambda function"
  type        = string
}

variable "lambda_diseases_invoke_arn" {
  description = "Invoke ARN of the diseases Lambda function"
  type        = string
}

variable "lambda_diseases_name" {
  description = "Name of the diseases Lambda function"
  type        = string
}

variable "lambda_breed_detection_invoke_arn" {
  description = "Invoke ARN of the breed detection Lambda function"
  type        = string
}

variable "lambda_breed_detection_name" {
  description = "Name of the breed detection Lambda function"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for JWT authorizer"
  type        = string
}

variable "cognito_app_client_id" {
  description = "Cognito App Client ID for JWT authorizer"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}