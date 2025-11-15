import torch
import sys
import os

# Get absolute paths
script_dir = os.path.dirname(os.path.abspath(__file__))
ml_dir = os.path.dirname(script_dir)

# Set paths for local training
os.environ['SM_MODEL_DIR'] = os.path.join(ml_dir, 'models')
os.environ['SM_CHANNEL_TRAIN'] = os.path.join(ml_dir, 'data', 'processed', 'train')
os.environ['SM_CHANNEL_VALIDATION'] = os.path.join(ml_dir, 'data', 'processed', 'validation')
os.environ['SM_OUTPUT_DATA_DIR'] = os.path.join(ml_dir, 'output')

# Create directories
os.makedirs(os.environ['SM_MODEL_DIR'], exist_ok=True)
os.makedirs(os.environ['SM_OUTPUT_DATA_DIR'], exist_ok=True)

# Verify paths exist
train_path = os.environ['SM_CHANNEL_TRAIN']
val_path = os.environ['SM_CHANNEL_VALIDATION']

if not os.path.exists(train_path):
    print(f"❌ Training data not found at: {train_path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Looking for data in: {os.path.join(ml_dir, 'data')}")
    sys.exit(1)

if not os.path.exists(val_path):
    print(f"❌ Validation data not found at: {val_path}")
    sys.exit(1)

print(f"✅ Training data found: {train_path}")
print(f"✅ Validation data found: {val_path}")

# Import training script
sys.path.insert(0, os.path.join(ml_dir, 'training'))
from train import main

if __name__ == '__main__':
    print("\n🚀 Training locally on Mac...")
    print("⏱️  This will take 2-4 hours on CPU\n")
    main()