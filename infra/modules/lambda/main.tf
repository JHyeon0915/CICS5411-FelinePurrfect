# infra/modules/lambda/main.tf

# IAM Role for Lambda Functions
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# ========================================
# CATS LAMBDA
# ========================================

resource "aws_lambda_function" "cats" {
  filename         = "${path.module}/../../lambda-functions/dist/cats.zip"
  function_name    = "${var.name_prefix}-cats"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/cats.zip")
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512
  
  environment {
    variables = {
      CATS_TABLE_NAME        = var.cats_table_name
      CAT_PHOTOS_BUCKET_NAME = var.cat_photos_bucket_name
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-cats-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "cats" {
  name              = "/aws/lambda/${aws_lambda_function.cats.function_name}"
  retention_in_days = 30

  tags = {
    Name        = "${var.name_prefix}-cats-logs"
    Environment = var.environment
  }
}

# ========================================
# LOGS LAMBDA
# ========================================

resource "aws_lambda_function" "logs" {
  filename         = "${path.module}/../../lambda-functions/dist/logs.zip"
  function_name    = "${var.name_prefix}-logs"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/logs.zip")
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512
  
  environment {
    variables = {
      LOGS_TABLE_NAME = var.logs_table_name
      CATS_TABLE_NAME = var.cats_table_name
      SNS_TOPIC_ARN   = var.sns_topic_arn
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-logs-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/aws/lambda/${aws_lambda_function.logs.function_name}"
  retention_in_days = 30
}

# ========================================
# DISEASES LAMBDA
# ========================================

resource "aws_lambda_function" "diseases" {
  filename         = "${path.module}/../../lambda-functions/dist/diseases.zip"
  function_name    = "${var.name_prefix}-diseases"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/diseases.zip")
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512
  
  environment {
    variables = {
      DISEASES_TABLE_NAME = var.diseases_table_name
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-diseases-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "diseases" {
  name              = "/aws/lambda/${aws_lambda_function.diseases.function_name}"
  retention_in_days = 30
}

# ========================================
# DASHBOARD ANALYSIS LAMBDA
# ========================================

resource "aws_lambda_function" "dashboard_analytics" {
  filename         = "${path.module}/../../lambda-functions/dist/dashboard-analytics.zip"
  function_name    = "${var.name_prefix}-dashboard-analytics"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/dashboard-analytics.zip")
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 512
  
  environment {
    variables = {
      LOGS_TABLE_NAME = var.logs_table_name
      CATS_TABLE_NAME = var.cats_table_name
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-dashboard-analytics-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "dashboard_analytics" {
  name              = "/aws/lambda/${aws_lambda_function.dashboard_analytics.function_name}"
  retention_in_days = 30
}

# ========================================
# CHECK MISSING LOGS LAMBDA
# ========================================

resource "aws_lambda_function" "check_missing_logs" {
  filename         = "${path.module}/../../lambda-functions/dist/check-missing-logs.zip"
  function_name    = "${var.name_prefix}-check-missing-logs"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/check-missing-logs.zip")
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 512
  
  environment {
    variables = {
      USERS_TABLE_NAME         = var.users_table_name
      CATS_TABLE_NAME          = var.cats_table_name
      LOGS_TABLE_NAME          = var.logs_table_name
      DEVICE_TOKENS_TABLE_NAME = var.device_tokens_table_name
      SNS_TOPIC_ARN            = var.sns_topic_arn
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-check-missing-logs-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "check_missing_logs" {
  name              = "/aws/lambda/${aws_lambda_function.check_missing_logs.function_name}"
  retention_in_days = 30
}


# ========================================
# BREED DETECTION LAMBDA
# ========================================

resource "aws_lambda_function" "breed_detection" {
  filename         = "${path.module}/../../lambda-functions/dist/breed-detection.zip"
  function_name    = "${var.name_prefix}-breed-detection"
  role             = var.lab_role_arn
  handler          = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dist/breed-detection.zip")
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 512
  
  environment {
    variables = {
      SAGEMAKER_ENDPOINT_NAME = var.sagemaker_endpoint_name
    }
  }
  
  tags = {
    Name        = "${var.name_prefix}-check-missing-logs-lambda"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "breed_detection" {
  name              = "/aws/lambda/${aws_lambda_function.breed_detection.function_name}"
  retention_in_days = 30
}
