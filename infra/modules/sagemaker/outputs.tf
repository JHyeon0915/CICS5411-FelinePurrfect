# modules/sagemaker/outputs.tf

output "sagemaker_endpoint_name" {
  description = "SageMaker endpoint name"
  value       = aws_sagemaker_endpoint.cat_breed_detector.name
}

output "sagemaker_endpoint_arn" {
  description = "SageMaker endpoint ARN"
  value       = aws_sagemaker_endpoint.cat_breed_detector.arn
}