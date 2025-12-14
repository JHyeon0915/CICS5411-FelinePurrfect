variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "feline-purrfect"
}

variable "lab_role_arn" {
  description = "ARN of the IAM role for Lambda functions"
  type        = string
}

variable "owner_email" {
  description = "Owner email for notifications"
  type        = string
}

variable "budget_alert_threshold" {
  description = "Budget alert threshold in USD"
  type        = number
  default     = 40
}