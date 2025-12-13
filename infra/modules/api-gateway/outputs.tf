# infra/modules/api-gateway/outputs.tf

output "api_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

output "api_endpoint" {
  description = "API Gateway endpoint"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_url" {
  description = "Full API Gateway URL with stage"
  value       = "${aws_apigatewayv2_api.main.api_endpoint}/${var.stage_name}"
}

output "stage_name" {
  description = "API Gateway stage name"
  value       = aws_apigatewayv2_stage.main.name
}

output "api_gateway_name" {
  description = "API Gateway name"
  value       = aws_apigatewayv2_api.main.name
}

output "api_execution_arn" {
  description = "API Gateway execution ARN for Lambda permissions"
  value       = aws_apigatewayv2_api.main.execution_arn
}
