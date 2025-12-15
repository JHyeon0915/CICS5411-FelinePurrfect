output "cats_function_arn" {
  description = "Cats Lambda function ARN"
  value       = aws_lambda_function.cats.arn
}

output "cats_function_name" {
  description = "Cats Lambda function name"
  value       = aws_lambda_function.cats.function_name
}

output "cats_invoke_arn" {
  description = "Cats Lambda invoke ARN"
  value       = aws_lambda_function.cats.invoke_arn
}

output "logs_function_arn" {
  description = "Logs Lambda function ARN"
  value       = aws_lambda_function.logs.arn
}

output "logs_function_name" {
  description = "Logs Lambda function name"
  value       = aws_lambda_function.logs.function_name
}

output "logs_invoke_arn" {
  description = "Logs Lambda invoke ARN"
  value       = aws_lambda_function.logs.invoke_arn
}

output "diseases_function_arn" {
  description = "Diseases Lambda function ARN"
  value       = aws_lambda_function.diseases.arn
}

output "diseases_function_name" {
  description = "Diseases Lambda function name"
  value       = aws_lambda_function.diseases.function_name
}

output "diseases_invoke_arn" {
  description = "Diseases Lambda invoke ARN"
  value       = aws_lambda_function.diseases.invoke_arn
}

output "dashboard_analytics_function_arn" {
  description = "Dashboard analytics Lambda function ARN"
  value       = aws_lambda_function.dashboard_analytics.arn
}

output "dashboard_analytics_function_name" {
  description = "Dashboard analytics Lambda function name"
  value       = aws_lambda_function.dashboard_analytics.function_name
}

output "dashboard_analytics_invoke_arn" {
  description = "Dashboard analytics Lambda invoke ARN"
  value       = aws_lambda_function.dashboard_analytics.invoke_arn
}

output "check_missing_logs_function_arn" {
  description = "Check missing logs Lambda function ARN"
  value       = aws_lambda_function.check_missing_logs.arn
}

output "check_missing_logs_function_name" {
  description = "Check missing logs Lambda function name"
  value       = aws_lambda_function.check_missing_logs.function_name
}

output "breed_detection_invoke_arn" {
  description = "Breed detection Lambda invoke ARN"
  value       = aws_lambda_function.breed_detection.invoke_arn
}

output "breed_detection_function_arn" {
  description = "Breed detection Lambda function ARN"
  value       = aws_lambda_function.breed_detection.arn
}

output "breed_detection_function_name" {
  description = "Breed detection Lambda function name"
  value       = aws_lambda_function.breed_detection.function_name
}

output "all_function_names" {
  description = "All Lambda function names"
  value = [
    aws_lambda_function.cats.function_name,
    aws_lambda_function.logs.function_name,
    aws_lambda_function.diseases.function_name,
    aws_lambda_function.dashboard_analytics.function_name,
    aws_lambda_function.check_missing_logs.function_name,
    aws_lambda_function.breed_detection.function_name
  ]
}
