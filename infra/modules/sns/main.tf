# modules/sns/main.tf

# Daily Reminders Topic
resource "aws_sns_topic" "reminders" {
  name         = "${var.name_prefix}-daily-reminders"
  display_name = "Daily Health Log Reminders"
  
  tags = {
    Name = "${var.name_prefix}-reminders-topic"
    Environment = var.environment
  }
}

# System Alerts Topic
resource "aws_sns_topic" "system_alerts" {
  name         = "${var.name_prefix}-system-alerts"
  display_name = "System Monitoring Alerts"
  
  tags = {
    Name = "${var.name_prefix}-system-alerts-topic"
    Environment = var.environment
  }
}

# Email Subscription for Daily Reminders (for testing)
resource "aws_sns_topic_subscription" "reminders_email" {
  topic_arn = aws_sns_topic.reminders.arn
  protocol  = "email"
  endpoint  = var.owner_email
}

# Email Subscription for System Alerts
resource "aws_sns_topic_subscription" "system_alerts_email" {
  topic_arn = aws_sns_topic.system_alerts.arn
  protocol  = "email"
  endpoint  = var.owner_email  # REPLACE in terraform.tfvars
}