variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "check_missing_logs_lambda_arn" {
  description = "Check missing logs Lambda function ARN"
  type        = string
}

variable "check_missing_logs_function_name" {
  description = "Check missing logs Lambda function name"
  type        = string
}