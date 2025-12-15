# modules/s3/variables.tf

variable "cat_photos_bucket_name" {
  description = "Name for cat photos bucket"
  type        = string
}

variable "backups_bucket_name" {
  description = "Name for backups bucket"
  type        = string
}

variable "ml_data_bucket_name" {
  description = "Name for ML data bucket"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}