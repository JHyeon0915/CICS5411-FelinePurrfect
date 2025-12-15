# modules/eventbridge/main.tf

# EventBridge Rule for Daily Reminders (11:30 PM UTC)
# Triggers at 11:30 PM UTC
# Cron format: minute hour day month weekday year
# Example: cron(30 23 * * ? *) = 11:30 PM UTC every day
resource "aws_cloudwatch_event_rule" "daily_reminder" {
  name                = "${var.name_prefix}-daily-reminder"
  description         = "Trigger daily health log reminders at 11:30 PM UTC"
  schedule_expression = "cron(30 23 * * ? *)"
  
  tags = {
    Name = "${var.name_prefix}-daily-reminder-rule"
    Environment = var.environment
  }
}

# EventBridge Target - Check Missing Logs Lambda
resource "aws_cloudwatch_event_target" "check_missing_logs" {
  rule      = aws_cloudwatch_event_rule.daily_reminder.name
  target_id = "CheckMissingLogsLambda"
  arn       = var.check_missing_logs_lambda_arn
}

# Lambda Permission for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = var.check_missing_logs_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_reminder.arn
}

# Optional: EventBridge Rule for Testing (every 5 minutes)
# Uncomment for testing, comment out for production
resource "aws_cloudwatch_event_rule" "test_reminder" {
  name                = "${var.name_prefix}-test-reminder"
  description         = "Test reminder every 5 minutes"
  schedule_expression = "rate(5 minutes)"
  state               = "DISABLED"  # Enable manually for testing
  
  tags = {
    Name        = "${var.name_prefix}-test-reminder-rule"
    Environment = "test"
  }
}

resource "aws_cloudwatch_event_target" "test_check_missing_logs" {
  rule      = aws_cloudwatch_event_rule.test_reminder.name
  target_id = "TestCheckMissingLogsLambda"
  arn       = var.check_missing_logs_lambda_arn
}

resource "aws_lambda_permission" "allow_eventbridge_test" {
  statement_id  = "AllowExecutionFromEventBridgeTest"
  action        = "lambda:InvokeFunction"
  function_name = var.check_missing_logs_function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.test_reminder.arn
}