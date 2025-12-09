# Generate random JWT secret
resource "random_password" "jwt_secret" {
  length  = var.jwt_secret_length
  special = true
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.name_prefix}-jwt-secret"
  description             = "JWT signing secret for authentication"
  recovery_window_in_days = 7
  
  tags = {
    Name = "${var.name_prefix}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret.result
}

# Database Encryption Key (optional, for additional encryption)
resource "random_password" "db_encryption_key" {
  length  = 32
  special = true
}

resource "aws_secretsmanager_secret" "db_encryption_key" {
  name                    = "${var.name_prefix}-db-encryption-key"
  description             = "Additional encryption key for sensitive database fields"
  recovery_window_in_days = 7
  
  tags = {
    Name = "${var.name_prefix}-db-encryption-key"
  }
}

resource "aws_secretsmanager_secret_version" "db_encryption_key" {
  secret_id     = aws_secretsmanager_secret.db_encryption_key.id
  secret_string = random_password.db_encryption_key.result
}

# SNS API Keys (placeholder - replace with actual SNS platform credentials)
resource "aws_secretsmanager_secret" "sns_api_keys" {
  name                    = "${var.name_prefix}-sns-api-keys"
  description             = "Push notification service API keys"
  recovery_window_in_days = 7
  
  tags = {
    Name = "${var.name_prefix}-sns-api-keys"
  }
}

resource "aws_secretsmanager_secret_version" "sns_api_keys" {
  secret_id = aws_secretsmanager_secret.sns_api_keys.id
  secret_string = jsonencode({
    # REPLACE WITH YOUR ACTUAL SNS PLATFORM CREDENTIALS
    # For Firebase Cloud Messaging (FCM):
    fcm_server_key = "YOUR_FCM_SERVER_KEY_HERE"
    
    # For Apple Push Notification Service (APNS):
    apns_key_id    = "YOUR_APNS_KEY_ID_HERE"
    apns_team_id   = "YOUR_APNS_TEAM_ID_HERE"
    apns_bundle_id = "YOUR_APP_BUNDLE_ID_HERE"
  })
}