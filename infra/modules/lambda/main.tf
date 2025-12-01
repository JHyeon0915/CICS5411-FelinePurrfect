# IAM Role for Lambda Functions
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# Auth Lambda Function
resource "aws_lambda_function" "auth" {
  filename         = "${path.module}/../../lambda-functions/auth.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-auth"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/auth.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      USERS_TABLE_NAME = var.users_table_name
      JWT_SECRET_ARN   = var.jwt_secret_arn
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-auth-lambda"
  }
}

# Cats Lambda Function
resource "aws_lambda_function" "cats" {
  filename         = "${path.module}/../../lambda-functions/cats.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-cats"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/cats.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      CATS_TABLE_NAME        = var.cats_table_name
      CAT_PHOTOS_BUCKET_NAME = var.cat_photos_bucket_name
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-cats-lambda"
  }
}

# Logs Lambda Function
resource "aws_lambda_function" "logs" {
  filename         = "${path.module}/../../lambda-functions/logs.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-logs"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/logs.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      LOGS_TABLE_NAME = var.logs_table_name
      CATS_TABLE_NAME = var.cats_table_name
      SNS_TOPIC_ARN   = var.sns_topic_arn
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-logs-lambda"
  }
}

# Diseases Lambda Function
resource "aws_lambda_function" "diseases" {
  filename         = "${path.module}/../../lambda-functions/diseases.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-diseases"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/diseases.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      LOGS_TABLE_NAME = var.logs_table_name
      CATS_TABLE_NAME = var.cats_table_name
      SNS_TOPIC_ARN   = var.sns_topic_arn
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-logs-lambda"
  }
}

# Dashboard analysis Lambda Function
resource "aws_lambda_function" "dashboard_analysis" {
  filename         = "${path.module}/../../lambda-functions/dashboard-analysis.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-dashboard-analysis"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/dashboard-analysis.zip")
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 512
  
  environment {
    variables = {
      LOGS_TABLE_NAME = var.logs_table_name
      CATS_TABLE_NAME = var.cats_table_name
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-dashboard-analysis-lambda"
  }
}

# Check Missing Logs Lambda Function
resource "aws_lambda_function" "check_missing_logs" {
  filename         = "${path.module}/../../lambda-functions/check-missing-logs.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-check-missing-logs"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/check-missing-logs.zip")
  runtime         = "nodejs20.x"
  timeout         = 60
  memory_size     = 512
  
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
    Name = "${var.name_prefix}-check-missing-logs-lambda"
  }
}

# JWT Authorizer Lambda Function
resource "aws_lambda_function" "authorizer" {
  filename         = "${path.module}/../../lambda-functions/authorizer.zip"  # CREATE THIS ZIP FILE
  function_name    = "${var.name_prefix}-jwt-authorizer"
  role            = data.aws_iam_role.lab_role.arn
  handler         = "index.handler"
  source_code_hash = filebase64sha256("${path.module}/../../lambda-functions/authorizer.zip")
  runtime         = "nodejs20.x"
  timeout         = 10
  memory_size     = 256
  
  environment {
    variables = {
      JWT_SECRET_ARN = var.jwt_secret_arn
    }
  }
  
  tags = {
    Name = "${var.name_prefix}-jwt-authorizer-lambda"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "auth" {
  name              = "/aws/lambda/${aws_lambda_function.auth.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "cats" {
  name              = "/aws/lambda/${aws_lambda_function.cats.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/aws/lambda/${aws_lambda_function.logs.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "diseases" {
  name              = "/aws/lambda/${aws_lambda_function.diseases.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "dashboard_analysis" {
  name              = "/aws/lambda/${aws_lambda_function.dashboard_analysis.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "check_missing_logs" {
  name              = "/aws/lambda/${aws_lambda_function.check_missing_logs.function_name}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "authorizer" {
  name              = "/aws/lambda/${aws_lambda_function.authorizer.function_name}"
  retention_in_days = 30
}