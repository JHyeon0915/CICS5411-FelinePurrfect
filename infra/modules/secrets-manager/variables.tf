variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "jwt_secret_length" {
  description = "Length of JWT secret"
  type        = number
  default     = 64
}