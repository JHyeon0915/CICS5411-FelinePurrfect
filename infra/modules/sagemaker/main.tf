# SageMaker Execution Role
resource "aws_iam_role" "sagemaker_role" {
  name = "${var.name_prefix}-sagemaker-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "sagemaker_full_access" {
  role       = aws_iam_role.sagemaker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

# SageMaker Model
resource "aws_sagemaker_model" "cat_breed_detector" {
  name               = "${var.name_prefix}-cat-breed-detector"
  execution_role_arn = aws_iam_role.sagemaker_role.arn
  
  primary_container {
    # REPLACE WITH YOUR ACTUAL MODEL IMAGE AND DATA
    image          = "763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0-cpu-py310"
    model_data_url = "s3://${var.ml_data_bucket_arn}/models/cat-breed-model.tar.gz"
  }
  
  tags = {
    Name = "${var.name_prefix}-sagemaker-model"
  }
}

# SageMaker Endpoint Configuration
resource "aws_sagemaker_endpoint_configuration" "cat_breed_detector" {
  name = "${var.name_prefix}-cat-breed-endpoint-config"
  
  production_variants {
    variant_name           = "AllTraffic"
    model_name             = aws_sagemaker_model.cat_breed_detector.name
    initial_instance_count = 1
    instance_type          = "ml.t2.medium"  # Cheapest option
  }
  
  tags = {
    Name = "${var.name_prefix}-endpoint-config"
  }
}

# SageMaker Endpoint
resource "aws_sagemaker_endpoint" "cat_breed_detector" {
  name                 = "${var.name_prefix}-cat-breed-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.cat_breed_detector.name
  
  tags = {
    Name = "${var.name_prefix}-sagemaker-endpoint"
  }
}