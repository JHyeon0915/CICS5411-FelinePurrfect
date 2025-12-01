terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

provider "aws" {
  region = var.aws_region

  # REPLACE WITH YOUR AWS CREDENTIALS
  # Option 1: Use AWS CLI credentials (recommended)
  # Run: aws configure
  # Then Terraform will use your default credentials

  # Option 2: Specify profile
  # profile = "your-aws-profile-name"

  default_tags {
    tags = {
      Project     = "Feline-Purrfect"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = var.owner_email # REPLACE WITH YOUR EMAIL
    }
  }
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current AWS region
data "aws_region" "current" {}