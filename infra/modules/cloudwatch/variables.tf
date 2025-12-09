variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "api_gateway_name" {
  description = "API Gateway name"
  type        = string
}

variable "lambda_function_names" {
  description = "List of Lambda function names"
  type        = list(string)
}

variable "sns_alarm_topic_arn" {
  description = "SNS topic ARN for alarms"
  type        = string
}

variable "budget_threshold" {
  description = "Budget threshold in USD"
  type        = number
}