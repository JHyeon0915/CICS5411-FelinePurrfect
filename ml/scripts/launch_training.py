import sagemaker
from sagemaker.pytorch import PyTorch
import boto3

# Get account info
sts = boto3.client('sts')
account_id = sts.get_caller_identity()['Account']
role = f"arn:aws:iam::{account_id}:role/LabRole"

print(f"Account: {account_id}")
print(f"Role: {role}")
sess = sagemaker.Session()

estimator = PyTorch(
    entry_point="train.py",
    source_dir="training",
    role=role,
    instance_count=1,
    instance_type="ml.p3.2xlarge",
    framework_version="2.0",
    py_version="py310",
    hyperparameters={
        "model": "efficientnet_b1",
        "epochs": 50,
        "patience": 12,
        "progressive-resize": True,
        "mixup-alpha": 0.7,
        "cutmix-alpha": 1.3,
        "mixup-prob": 0.8,
    },
    use_spot_instances=True,
    max_wait=7200,
    max_run=3600,
    checkpoint_s3_uri="s3://feline-purrfect-ml/checkpoints/",
    output_path="s3://feline-purrfect-ml-model/models/",
)

# Start training
estimator.fit({
    "train": "s3://feline-purrfect-ml/cat-breeds/train",
    "validation": "s3://feline-purrfect-ml/cat-breeds/validation"
})

print(f"\n✅ Training started: {estimator.latest_training_job.name}")