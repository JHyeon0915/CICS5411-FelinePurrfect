# modules/sagemaker/variables.tf

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "ml_data_bucket_name" {
  description = "ML data S3 bucket NAME"
  type        = string
}