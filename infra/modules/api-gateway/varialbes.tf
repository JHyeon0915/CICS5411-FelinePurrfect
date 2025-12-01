variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "lambda_auth_arn" {
  description = "Auth Lambda function ARN"
  type        = string
}

variable "lambda_cats_arn" {
  description = "Cats Lambda function ARN"
  type        = string
}

variable "lambda_logs_arn" {
  description = "Logs Lambda function ARN"
  type        = string
}

variable "lambda_dashboard_arn" {
  description = "Dashboard Lambda function ARN"
  type        = string
}

variable "lambda_authorizer_arn" {
  description = "JWT Authorizer Lambda function ARN"
  type        = string
}

variable "lambda_authorizer_invoke_arn" {
  description = "JWT Authorizer Lambda function invoke ARN"
  type        = string
}