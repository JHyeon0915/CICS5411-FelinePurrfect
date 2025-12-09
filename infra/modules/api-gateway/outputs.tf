output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_name" {
  description = "API Gateway name"
  value       = aws_apigatewayv2_api.main.name
}

output "api_invoke_url" {
  description = "API Gateway invoke URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "stage_arn" {
  description = "API Gateway stage ARN"
  value       = aws_apigatewayv2_stage.main.arn
}

output "execution_arn" {
  description = "Execution ARN of the API Gateway"
  value       = aws_apigatewayv2_api.main.execution_arn
}