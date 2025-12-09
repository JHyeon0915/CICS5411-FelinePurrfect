# Daily Reminders Topic
resource "aws_sns_topic" "reminders" {
  name         = "${var.name_prefix}-daily-reminders"
  display_name = "Daily Health Log Reminders"
  
  tags = {
    Name = "${var.name_prefix}-reminders-topic"
  }
}

# System Alerts Topic
resource "aws_sns_topic" "system_alerts" {
  name         = "${var.name_prefix}-system-alerts"
  display_name = "System Monitoring Alerts"
  
  tags = {
    Name = "${var.name_prefix}-system-alerts-topic"
  }
}

# Email Subscription for System Alerts
resource "aws_sns_topic_subscription" "system_alerts_email" {
  topic_arn = aws_sns_topic.system_alerts.arn
  protocol  = "email"
  endpoint  = var.owner_email  # REPLACE in terraform.tfvars
}