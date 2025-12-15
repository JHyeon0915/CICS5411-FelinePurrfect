# modules/sns/outputs.tf

output "reminders_topic_arn" {
  description = "Daily reminders SNS topic ARN"
  value       = aws_sns_topic.reminders.arn
}

output "system_alerts_topic_arn" {
  description = "System alerts SNS topic ARN"
  value       = aws_sns_topic.system_alerts.arn
}