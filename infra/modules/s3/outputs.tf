# infra/modules/s3/outputs.tf

output "cat_photos_bucket_name" {
  description = "Cat photos bucket name"
  value       = aws_s3_bucket.cat_photos.id
}

output "cat_photos_bucket_arn" {
  description = "Cat photos bucket ARN"
  value       = aws_s3_bucket.cat_photos.arn
}

output "backups_bucket_name" {
  description = "Backups bucket name"
  value       = aws_s3_bucket.backups.id
}

output "backups_bucket_arn" {
  description = "Backups bucket ARN"
  value       = aws_s3_bucket.backups.arn
}

output "ml_data_bucket_name" {
  description = "ML data bucket name"
  value       = aws_s3_bucket.ml_data.id
}

output "ml_data_bucket_arn" {
  description = "ML data bucket ARN"
  value       = aws_s3_bucket.ml_data.arn
}