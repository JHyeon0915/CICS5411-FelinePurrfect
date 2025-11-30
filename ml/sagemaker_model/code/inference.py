
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
