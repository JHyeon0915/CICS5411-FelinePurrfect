output "daily_reminder_rule_arn" {
  description = "Daily reminder EventBridge rule ARN"
  value       = aws_cloudwatch_event_rule.daily_reminder.arn
}