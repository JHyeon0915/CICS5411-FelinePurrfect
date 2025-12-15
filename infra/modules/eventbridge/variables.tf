# modules/eventbridge/variables.tf

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "check_missing_logs_lambda_arn" {
  description = "Check missing logs Lambda function ARN"
  type        = string
}

variable "check_missing_logs_function_name" {
  description = "Check missing logs Lambda function name"
  type        = string
}