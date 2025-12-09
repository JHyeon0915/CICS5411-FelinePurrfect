# Users Table
resource "aws_dynamodb_table" "users" {
  name         = "${var.name_prefix}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  attribute {
    name = "email"
    type = "S"
  }
  
  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.name_prefix}-users-table"
  }
}

# Cats Table
resource "aws_dynamodb_table" "cats" {
  name         = "${var.name_prefix}-cats"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "catId"
  
  attribute {
    name = "catId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.name_prefix}-cats-table"
  }
}

# Logs Table
resource "aws_dynamodb_table" "logs" {
  name         = "${var.name_prefix}-logs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "catId"
  range_key    = "date"
  
  attribute {
    name = "catId"
    type = "S"
  }
  
  attribute {
    name = "date"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  global_secondary_index {
    name            = "userId-date-index"
    hash_key        = "userId"
    range_key       = "date"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "date-index"
    hash_key        = "date"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.name_prefix}-logs-table"
  }
}

# Diseases Table
resource "aws_dynamodb_table" "diseases" {
  name         = "${var.name_prefix}-diseases"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "diseaseId"
  
  attribute {
    name = "diseaseId"
    type = "S"
  }
  
  attribute {
    name = "name"
    type = "S"
  }
  
  global_secondary_index {
    name            = "name-index"
    hash_key        = "name"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.name_prefix}-diseases-table"
  }
}

# Device Tokens Table
resource "aws_dynamodb_table" "device_tokens" {
  name         = "${var.name_prefix}-device-tokens"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.name_prefix}-device-tokens-table"
  }
}