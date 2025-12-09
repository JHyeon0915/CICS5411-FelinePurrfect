import torch
import torch.nn as nn
from torchvision import models
import json
import os
import tarfile
import shutil

print("="*60)
print("PREPARING MODEL FOR SAGEMAKER DEPLOYMENT")
print("="*60)

# ===== STEP 1: Load your trained model =====
print("\n📦 Loading trained model...")

# Load checkpoint (your model.pth has everything)
checkpoint = torch.load('models/model.pth', 
                       map_location=torch.device('cpu'),
                       weights_only=False)

# Get classes from checkpoint
classes = checkpoint['classes']
num_classes = len(classes)

print(f"✅ Found {num_classes} classes")
print(f"Classes: {classes[:5]}..." if len(classes) > 5 else f"Classes: {classes}")

# Rebuild model architecture (same as training)
model_name = checkpoint['args']['model']
print(f"✅ Model architecture: {model_name}")

# Build model
if model_name == "efficientnet_b0":
    model = models.efficientnet_b0()
    dropout = 0.5
elif model_name == "efficientnet_b1":
    model = models.efficientnet_b1()
    dropout = 0.5
elif model_name == "efficientnet_b2":
    model = models.efficientnet_b2()
    dropout = 0.5
else:
    # Default to b1 if not specified
    model = models.efficientnet_b1()
    dropout = 0.5

# Replace classifier
in_features = model.classifier[1].in_features
model.classifier = nn.Sequential(
    nn.Dropout(dropout),
    nn.Linear(in_features, num_classes)
)

# Load trained weights
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

print(f"✅ Model loaded with best accuracy: {checkpoint['best_acc']:.2f}%")

# ===== STEP 2: Create deployment directory =====
print("\n📁 Creating deployment package...")

# Clean and create fresh directory
if os.path.exists('sagemaker_model'):
    shutil.rmtree('sagemaker_model')
os.makedirs('sagemaker_model/code', exist_ok=True)

# Save model weights only (lighter package)
torch.save({
    'model_state_dict': model.state_dict(),
    'model_name': model_name,
    'num_classes': num_classes
}, 'sagemaker_model/model.pth')

print(f"✅ Saved model weights")

# ===== STEP 3: Save classes =====
with open('sagemaker_model/classes.json', 'w') as f:
    json.dump({'classes': classes}, f, indent=2)

print(f"✅ Saved classes.json")

# ===== STEP 4: Create inference script =====
inference_code = '''
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import json
import os
import io

def model_fn(model_dir):
    """Load model for SageMaker inference"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Loading model on {device}...")
    
    # Load classes
    with open(os.path.join(model_dir, "classes.json"), 'r') as f:
        class_data = json.load(f)
        classes = class_data['classes']
    
    # Load model checkpoint
    checkpoint = torch.load(
        os.path.join(model_dir, "model.pth"), 
        map_location=device,
        weights_only=True
    )
    
    model_name = checkpoint.get('model_name', 'efficientnet_b1')
    num_classes = checkpoint['num_classes']
    
    # Build model architecture
    if model_name == "efficientnet_b0":
        model = models.efficientnet_b0()
        dropout = 0.5
    elif model_name == "efficientnet_b1":
        model = models.efficientnet_b1()
        dropout = 0.5
    elif model_name == "efficientnet_b2":
        model = models.efficientnet_b2()
        dropout = 0.5
    else:
        model = models.efficientnet_b1()
        dropout = 0.5
    
    # Replace classifier
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(in_features, num_classes)
    )
    
    # Load weights
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    print(f"Model loaded successfully with {num_classes} classes")
    
    return {'model': model, 'classes': classes, 'device': device}

def input_fn(request_body, content_type='application/x-image'):
    """Process input image"""
    print(f"Received request with content type: {content_type}")
    
    if content_type == 'application/x-image':
        image = Image.open(io.BytesIO(request_body)).convert('RGB')
        return image
    elif content_type == 'application/json':
        # Support JSON input with base64 image
        import base64
        data = json.loads(request_body)
        image_bytes = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        return image
    else:
        raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(input_data, model_dict):
    """Make prediction"""
    model = model_dict['model']
    classes = model_dict['classes']
    device = model_dict['device']
    
    # Transform (same as validation in training)
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    image_tensor = transform(input_data).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted = probabilities.max(1)
    
    # Get top 5 predictions
    top5_prob, top5_idx = probabilities[0].topk(min(5, len(classes)))
    top5_breeds = [
        {
            'breed': classes[idx],
            'confidence': float(prob)
        }
        for idx, prob in zip(top5_idx.tolist(), top5_prob.tolist())
    ]
    
    return {
        'breed': classes[predicted.item()],
        'confidence': float(confidence.item()),
        'top_breeds': top5_breeds
    }

def output_fn(prediction, accept='application/json'):
    """Format output"""
    if accept == 'application/json':
        return json.dumps(prediction), accept
    raise ValueError(f"Unsupported accept type: {accept}")
'''

with open('sagemaker_model/code/inference.py', 'w') as f:
    f.write(inference_code)

print("✅ Created inference.py")

# ===== STEP 5: Create requirements.txt =====
requirements = '''torchvision==0.15.2
Pillow==10.0.0
'''

with open('sagemaker_model/code/requirements.txt', 'w') as f:
    f.write(requirements)

print("✅ Created requirements.txt")

# ===== STEP 6: Create tar.gz =====
print("\n📦 Creating model.tar.gz...")

# Create tar.gz from sagemaker_model directory
with tarfile.open('model.tar.gz', 'w:gz') as tar:
    tar.add('sagemaker_model', arcname='.')

print("✅ model.tar.gz created successfully!")

# ===== STEP 7: Summary =====
print("\n" + "="*60)
print("DEPLOYMENT PACKAGE READY")
print("="*60)
print(f"📦 Package: model.tar.gz")
print(f"📊 Classes: {num_classes}")
print(f"🎯 Model: {model_name}")
print(f"✨ Best Accuracy: {checkpoint['best_acc']:.2f}%")
print("\n📁 Package contents:")
print("  ├── model.pth (model weights)")
print("  ├── classes.json (breed names)")
print("  └── code/")
print("      ├── inference.py")
print("      └── requirements.txt")

# Verify tar.gz
print("\n🔍 Verifying package...")
with tarfile.open('model.tar.gz', 'r:gz') as tar:
    members = tar.getnames()
    print(f"✅ Found {len(members)} files in package:")
    for member in members:
        print(f"   - {member}")

print("\n" + "="*60)
print("NEXT STEPS")
print("="*60)
print("\n1️⃣  Upload to S3:")
print("   aws s3 cp model.tar.gz s3://YOUR-BUCKET-NAME/models/cat-breed-model.tar.gz")
print("\n2️⃣  Get your bucket name:")
print("   terraform output")
print("\n3️⃣  Deploy SageMaker endpoint:")
print("   terraform apply -target=module.sagemaker")
print("\n4️⃣  Test endpoint:")
print("   aws sagemaker-runtime invoke-endpoint \\")
print("     --endpoint-name feline-purrfect-dev-cat-breed-endpoint \\")
print("     --body fileb://test-cat.jpg \\")
print("     --content-type application/x-image \\")
print("     output.json")
print("\n" + "="*60)