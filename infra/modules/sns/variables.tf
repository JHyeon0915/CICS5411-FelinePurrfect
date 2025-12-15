# modules/sns/variables.tf

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "owner_email" {
  description = "Email address for system alerts"
  type        = string
}