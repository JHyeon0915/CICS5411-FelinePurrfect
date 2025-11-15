import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import json
import os
import io

def model_fn(model_dir):
    """Load model for inference"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Load classes
    with open(os.path.join(model_dir, "classes.json"), 'r') as f:
        class_data = json.load(f)
        classes = class_data['classes']
    
    # Build model
    model = models.efficientnet_b0()
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(in_features, len(classes))
    )
    
    # Load weights
    checkpoint = torch.load(os.path.join(model_dir, "model.pth"), map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    return {'model': model, 'classes': classes, 'device': device}

def input_fn(request_body, content_type='application/x-image'):
    """Process input image"""
    if content_type == 'application/x-image':
        image = Image.open(io.BytesIO(request_body)).convert('RGB')
        return image
    else:
        raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(input_data, model_dict):
    """Make prediction"""
    model = model_dict['model']
    classes = model_dict['classes']
    device = model_dict['device']
    
    # Transform
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
    top5_prob, top5_idx = probabilities[0].topk(5)
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