# Cat Photos Bucket
resource "aws_s3_bucket" "cat_photos" {
  bucket = var.cat_photos_bucket_name
  
  tags = {
    Name    = "Cat Photos Bucket"
    Purpose = "Store cat profile photos"
  }
}

resource "aws_s3_bucket_versioning" "cat_photos" {
  bucket = aws_s3_bucket.cat_photos.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "cat_photos" {
  bucket = aws_s3_bucket.cat_photos.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "cat_photos" {
  bucket = aws_s3_bucket.cat_photos.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "cat_photos" {
  bucket = aws_s3_bucket.cat_photos.id
  
  rule {
    id     = "archive-old-photos"
    status = "Enabled"

    filter {}
    
    transition {
      days          = 90
      storage_class = "INTELLIGENT_TIERING"
    }
    
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "cat_photos" {
  bucket = aws_s3_bucket.cat_photos.id
  
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]  # REPLACE with your actual domain in production
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Backups Bucket
resource "aws_s3_bucket" "backups" {
  bucket = var.backups_bucket_name
  
  tags = {
    Name    = "Backups Bucket"
    Purpose = "Store database backups"
  }
}

resource "aws_s3_bucket_versioning" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "backups" {
  bucket = aws_s3_bucket.backups.id
  
  rule {
    id     = "archive-backups"
    status = "Enabled"

    filter {}
    
    transition {
      days          = 30
      storage_class = "GLACIER"
    }
    
    expiration {
      days = 365
    }
  }
}

# ML Data Bucket
resource "aws_s3_bucket" "ml_data" {
  bucket = var.ml_data_bucket_name
  
  tags = {
    Name    = "ML Data Bucket"
    Purpose = "Store ML training data and models"
  }
}

resource "aws_s3_bucket_versioning" "ml_data" {
  bucket = aws_s3_bucket.ml_data.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "ml_data" {
  bucket = aws_s3_bucket.ml_data.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "ml_data" {
  bucket = aws_s3_bucket.ml_data.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}