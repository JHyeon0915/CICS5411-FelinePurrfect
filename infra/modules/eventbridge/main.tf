# EventBridge Rule for Daily Reminders (11:30 PM UTC)
resource "aws_cloudwatch_event_rule" "daily_reminder" {
  name                = "${var.name_prefix}-daily-reminder"
  description         = "Trigger daily health log reminders at 11:30 PM UTC"
  schedule_expression = "cron(30 23 * * ? *)"
  
  tags = {
    Name = "${var.name_prefix}-daily-reminder-rule"
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