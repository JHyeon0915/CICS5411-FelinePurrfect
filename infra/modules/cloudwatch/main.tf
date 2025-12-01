# Lambda Error Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  count               = length(var.lambda_function_names)
  alarm_name          = "${var.name_prefix}-${var.lambda_function_names[count.index]}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Alert when Lambda function has more than 5 errors"
  alarm_actions       = [var.sns_alarm_topic_arn]
  
  dimensions = {
    FunctionName = var.lambda_function_names[count.index]
  }
  
  tags = {
    Name = "${var.name_prefix}-lambda-error-alarm"
  }
}

# API Gateway 5xx Errors Alarm
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.name_prefix}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "Alert when API Gateway has more than 10 5xx errors"
  alarm_actions       = [var.sns_alarm_topic_arn]
  
  dimensions = {
    ApiName = var.api_gateway_name
  }
  
  tags = {
    Name = "${var.name_prefix}-api-5xx-alarm"
  }
}

# Budget Alert (using CloudWatch for cost monitoring)
resource "aws_cloudwatch_metric_alarm" "budget_alert" {
  alarm_name          = "${var.name_prefix}-budget-alert"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = "21600"  # 6 hours
  statistic           = "Maximum"
  threshold           = var.budget_threshold
  alarm_description   = "Alert when estimated charges exceed ${var.budget_threshold} USD"
  alarm_actions       = [var.sns_alarm_topic_arn]
  
  dimensions = {
    Currency = "USD"
  }
  
  tags = {
    Name = "${var.name_prefix}-budget-alarm"
  }
}

# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.name_prefix}-dashboard"
  
  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            for fn in var.lambda_function_names : [
              "AWS/Lambda",
              "Invocations",
              {
                stat = "Sum"
                label = fn
              }
            ]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "Lambda Invocations"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = data.aws_region.current.name
          title  = "API Gateway Requests"
        }
      }
    ]
  })
}

data "aws_region" "current" {}