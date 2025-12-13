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