# modules/sagemaker/main.tf

# IAM Role for SageMaker
data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

# SageMaker Model
resource "aws_sagemaker_model" "cat_breed_detector" {
  name               = "${var.name_prefix}-cat-breed-detector"
  execution_role_arn = data.aws_iam_role.lab_role.arn
  
  primary_container {
    # PyTorch inference image (available in us-east-1)
    image = "763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0-cpu-py310"

    model_data_url = "s3://${var.ml_data_bucket_name}/models/model.tar.gz"
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
    instance_type          = "ml.m5.large"  # Learner Lab supported type
  }
  
  tags = {
    Name = "${var.name_prefix}-endpoint-config"
    Environment = var.environment
  }
}

# SageMaker Endpoint
resource "aws_sagemaker_endpoint" "cat_breed_detector" {
  name                 = "${var.name_prefix}-cat-breed-endpoint"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.cat_breed_detector.name
  
  tags = {
    Name        = "${var.name_prefix}-sagemaker-endpoint"
    Environment = var.environment
  }
}