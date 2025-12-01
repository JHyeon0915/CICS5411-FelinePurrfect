output "auth_function_arn" {
  description = "Auth Lambda function ARN"
  value       = aws_lambda_function.auth.arn
}

output "auth_function_name" {
  description = "Auth Lambda function name"
  value       = aws_lambda_function.auth.function_name
}

output "cats_function_arn" {
  description = "Cats Lambda function ARN"
  value       = aws_lambda_function.cats.arn
}

output "cats_function_name" {
  description = "Cats Lambda function name"
  value       = aws_lambda_function.cats.function_name
}

output "logs_function_arn" {
  description = "Logs Lambda function ARN"
  value       = aws_lambda_function.logs.arn
}

output "logs_function_name" {
  description = "Logs Lambda function name"
  value       = aws_lambda_function.logs.function_name
}

output "diseases_function_arn" {
  description = "Diseases Lambda function ARN"
  value       = aws_lambda_function.diseases.arn
}

output "diseases_function_name" {
  description = "Diseases Lambda function name"
  value       = aws_lambda_function.diseases.function_name
}

output "dashboard_analysis_function_arn" {
  description = "Dashboard analysis Lambda function ARN"
  value       = aws_lambda_function.dashboard_analysis.arn
}

output "dashboard_analysis_function_name" {
  description = "Dashboard analysis Lambda function name"
  value       = aws_lambda_function.dashboard_analysis.function_name
}

output "check_missing_logs_function_arn" {
  description = "Check missing logs Lambda function ARN"
  value       = aws_lambda_function.check_missing_logs.arn
}

output "check_missing_logs_function_name" {
  description = "Check missing logs Lambda function name"
  value       = aws_lambda_function.check_missing_logs.function_name
}

output "authorizer_function_arn" {
  description = "JWT authorizer Lambda function ARN"
  value       = aws_lambda_function.authorizer.arn
}

output "authorizer_function_name" {
  description = "JWT authorizer Lambda function name"
  value       = aws_lambda_function.authorizer.function_name
}

output "authorizer_invoke_arn" {
  description = "Invoke ARN of the authorizer Lambda function"
  value       = aws_lambda_function.authorizer.invoke_arn
}

output "all_function_names" {
  description = "All Lambda function names"
  value = [
    aws_lambda_function.auth.function_name,
    aws_lambda_function.cats.function_name,
    aws_lambda_function.logs.function_name,
    aws_lambda_function.diseases.function_name,
    aws_lambda_function.dashboard_analysis.function_name,
    aws_lambda_function.check_missing_logs.function_name,
    aws_lambda_function.authorizer.function_name
  ]
}