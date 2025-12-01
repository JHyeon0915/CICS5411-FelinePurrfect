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

variable "owner_email" {
  description = "Owner email for notifications"
  type        = string
}

variable "budget_alert_threshold" {
  description = "Budget alert threshold in USD"
  type        = number
  default     = 40
}

variable "jwt_secret_length" {
  description = "Length of JWT secret key"
  type        = number
  default     = 64
}