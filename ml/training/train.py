import os
import json
import argparse
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, datasets, models
from torch.utils.data import DataLoader
from torch.amp import autocast, GradScaler
from tqdm import tqdm
import numpy as np

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", type=str, default=os.environ.get("SM_MODEL_DIR", "./model"))
    parser.add_argument("--train", type=str, default=os.environ.get("SM_CHANNEL_TRAIN", "./data/train"))
    parser.add_argument("--validation", type=str, default=os.environ.get("SM_CHANNEL_VALIDATION", "./data/validation"))
    parser.add_argument("--output-data-dir", type=str, default=os.environ.get("SM_OUTPUT_DATA_DIR", "./output"))
    parser.add_argument("--epochs", type=int, default=40)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.0003)
    parser.add_argument("--num-workers", type=int, default=4)
    parser.add_argument("--patience", type=int, default=10)
    
    # Advanced augmentation
    parser.add_argument("--mixup-alpha", type=float, default=0.6, help="Stronger mixup")
    parser.add_argument("--cutmix-alpha", type=float, default=1.2, help="Stronger cutmix")
    parser.add_argument("--mixup-prob", type=float, default=0.7, help="More frequent augmentation")
    
    # Model architecture
    parser.add_argument("--model", type=str, default="efficientnet_b1", 
                       choices=["efficientnet_b0", "efficientnet_b1", "efficientnet_b2"])
    
    # Progressive training
    parser.add_argument("--progressive-resize", action='store_true', help="Start with 192px, end with 224px")
    
    return parser.parse_args()

def mixup_data(x, y, alpha=0.6):
    """Apply Mixup augmentation with stronger mixing"""
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    
    mixed_x = lam * x + (1 - lam) * x[index]
    y_a, y_b = y, y[index]
    
    return mixed_x, y_a, y_b, lam

def rand_bbox(size, lam):
    """Generate random bounding box for CutMix"""
    W = size[2]
    H = size[3]
    cut_rat = np.sqrt(1. - lam)
    cut_w = int(W * cut_rat)
    cut_h = int(H * cut_rat)
    
    cx = np.random.randint(W)
    cy = np.random.randint(H)
    
    bbx1 = np.clip(cx - cut_w // 2, 0, W)
    bby1 = np.clip(cy - cut_h // 2, 0, H)
    bbx2 = np.clip(cx + cut_w // 2, 0, W)
    bby2 = np.clip(cy + cut_h // 2, 0, H)
    
    return bbx1, bby1, bbx2, bby2

def cutmix_data(x, y, alpha=1.2):
    """Apply CutMix augmentation with stronger mixing"""
    if alpha > 0:
        lam = np.random.beta(alpha, alpha)
    else:
        lam = 1
    
    batch_size = x.size(0)
    index = torch.randperm(batch_size).to(x.device)
    
    bbx1, bby1, bbx2, bby2 = rand_bbox(x.size(), lam)
    x[:, :, bbx1:bbx2, bby1:bby2] = x[index, :, bbx1:bbx2, bby1:bby2]
    
    lam = 1 - ((bbx2 - bbx1) * (bby2 - bby1) / (x.size()[-1] * x.size()[-2]))
    
    y_a, y_b = y, y[index]
    return x, y_a, y_b, lam

def mixup_criterion(criterion, pred, y_a, y_b, lam):
    """Mixed loss for mixup/cutmix"""
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)

def build_model(num_classes, model_name="efficientnet_b1"):
    """Build model with flexible architecture"""
    print(f"Building {model_name} for {num_classes} classes...")
    
    if model_name == "efficientnet_b0":
        model = models.efficientnet_b0(weights='IMAGENET1K_V1')
        dropout = 0.5
    elif model_name == "efficientnet_b1":
        model = models.efficientnet_b1(weights='IMAGENET1K_V1')
        dropout = 0.5
    elif model_name == "efficientnet_b2":
        model = models.efficientnet_b2(weights='IMAGENET1K_V1')
        dropout = 0.5
    
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(in_features, num_classes)
    )
    
    return model

def get_data_loaders(train_dir, val_dir, batch_size, num_workers, img_size=224, progressive=False, epoch=0):
    """Create data loaders with optional progressive resizing"""
    
    # Progressive resizing: start smaller, grow to full size
    if progressive:
        if epoch < 10:
            current_size = 192
        elif epoch < 20:
            current_size = 208
        else:
            current_size = 224
    else:
        current_size = img_size
    
    print(f"Using image size: {current_size}x{current_size}")
    
    # More aggressive augmentation
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(current_size, scale=(0.6, 1.0)),  # Even more aggressive
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(25),  # Increased rotation
        transforms.ColorJitter(brightness=0.4, contrast=0.4, saturation=0.4, hue=0.15),  # Stronger
        transforms.RandomAffine(degrees=0, translate=(0.15, 0.15), shear=10),  # Added shear
        transforms.RandomGrayscale(p=0.15),  # More frequent
        transforms.RandomPerspective(distortion_scale=0.2, p=0.3),  # Added perspective
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.2, scale=(0.02, 0.15))  # Random erasing
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(int(current_size * 1.14)),  # 256 for 224
        transforms.CenterCrop(current_size),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True,
                             num_workers=num_workers, pin_memory=True, drop_last=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False,
                           num_workers=num_workers, pin_memory=True)
    
    return train_loader, val_loader, train_dataset.classes

def train_epoch(model, train_loader, criterion, optimizer, scaler, device, args, epoch):
    """Train with advanced mixup/cutmix"""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for images, labels in tqdm(train_loader, desc="Training"):
        images, labels = images.to(device), labels.to(device)
        
        # Higher probability of mixup/cutmix
        use_augmentation = np.random.rand() < args.mixup_prob
        
        if use_augmentation:
            if np.random.rand() < 0.5:
                images, labels_a, labels_b, lam = mixup_data(images, labels, args.mixup_alpha)
            else:
                images, labels_a, labels_b, lam = cutmix_data(images, labels, args.cutmix_alpha)
            
            optimizer.zero_grad()
            
            with autocast('cuda'):
                outputs = model(images)
                loss = mixup_criterion(criterion, outputs, labels_a, labels_b, lam)
            
            scaler.scale(loss).backward()
            
            # Gradient clipping for stability
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            
            scaler.step(optimizer)
            scaler.update()
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += (lam * predicted.eq(labels_a).sum().item() + 
                       (1 - lam) * predicted.eq(labels_b).sum().item())
        else:
            optimizer.zero_grad()
            
            with autocast('cuda'):
                outputs = model(images)
                loss = criterion(outputs, labels)
            
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    return running_loss / len(train_loader), 100. * correct / total

def validate(model, val_loader, criterion, device):
    """Standard validation"""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for images, labels in tqdm(val_loader, desc="Validation"):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    return running_loss / len(val_loader), 100. * correct / total

def main():
    args = parse_args()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Initial data loaders
    train_loader, val_loader, classes = get_data_loaders(
        args.train, args.validation, args.batch_size, args.num_workers,
        progressive=args.progressive_resize, epoch=0
    )
    
    print(f"Training samples: {len(train_loader.dataset)}")
    print(f"Validation samples: {len(val_loader.dataset)}")
    print(f"Number of classes: {len(classes)}")
    print(f"Samples per class: {len(train_loader.dataset) / len(classes):.1f}")
    
    model = build_model(len(classes), args.model).to(device)
    
    # Stronger regularization
    criterion = nn.CrossEntropyLoss(label_smoothing=0.2)  # Increased from 0.15
    
    # Use AdamW with higher weight decay
    optimizer = torch.optim.AdamW(
        model.parameters(),
        lr=args.lr,
        weight_decay=0.08,  # Increased from 0.05
        betas=(0.9, 0.999)
    )
    
    # Warmup + CosineAnnealing
    warmup_epochs = 3
    scheduler_warmup = torch.optim.lr_scheduler.LinearLR(
        optimizer, start_factor=0.1, total_iters=warmup_epochs
    )
    scheduler_cosine = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=args.epochs - warmup_epochs, eta_min=1e-6
    )
    
    scaler = GradScaler('cuda')
    
    best_acc = 0.0
    best_epoch = 0
    patience_counter = 0
    history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}
    
    print("\n" + "="*60)
    print("OPTIMIZED TRAINING")
    print("="*60)
    print(f"Model: {args.model}")
    print(f"Mixup alpha: {args.mixup_alpha}")
    print(f"CutMix alpha: {args.cutmix_alpha}")
    print(f"Aug probability: {args.mixup_prob}")
    print(f"Label smoothing: 0.2")
    print(f"Weight decay: 0.08")
    print(f"Progressive resize: {args.progressive_resize}")
    print(f"Warmup epochs: {warmup_epochs}")
    print("="*60 + "\n")
    
    for epoch in range(args.epochs):
        print(f"\nEpoch [{epoch+1}/{args.epochs}]")
        
        # Update data loaders if using progressive resizing
        if args.progressive_resize and epoch in [10, 20]:
            train_loader, val_loader, _ = get_data_loaders(
                args.train, args.validation, args.batch_size, args.num_workers,
                progressive=True, epoch=epoch
            )
        
        train_loss, train_acc = train_epoch(
            model, train_loader, criterion, optimizer, scaler, device, args, epoch
        )
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Step scheduler
        if epoch < warmup_epochs:
            scheduler_warmup.step()
        else:
            scheduler_cosine.step()
        
        history['train_loss'].append(train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(val_loss)
        history['val_acc'].append(val_acc)
        
        overfit_gap = train_acc - val_acc
        current_lr = optimizer.param_groups[0]['lr']
        
        print(f"Train: {train_loss:.4f} / {train_acc:.2f}%")
        print(f"Val:   {val_loss:.4f} / {val_acc:.2f}%")
        print(f"Gap:   {overfit_gap:+.2f}%")
        print(f"LR:    {current_lr:.6f}")
        
        if val_acc > best_acc:
            best_acc = val_acc
            best_epoch = epoch
            patience_counter = 0
            print(f"✨ NEW BEST: {best_acc:.2f}%")
            
            os.makedirs(args.model_dir, exist_ok=True)
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'best_acc': best_acc,
                'classes': classes,
                'history': history,
                'args': vars(args)
            }, os.path.join(args.model_dir, "model.pth"))
            
            print(f"💾 Model saved")
        else:
            patience_counter += 1
            print(f"⏳ No improvement ({patience_counter}/{args.patience})")
            
            if patience_counter >= args.patience:
                print(f"\n🛑 Early stopping triggered!")
                print(f"Best: {best_acc:.2f}% at epoch {best_epoch+1}")
                break
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE")
    print("="*60)
    print(f"Best Val Acc: {best_acc:.2f}% (Epoch {best_epoch+1})")
    print(f"Final Gap: {history['train_acc'][best_epoch] - best_acc:+.2f}%")
    print("="*60)
    
    os.makedirs(args.output_data_dir, exist_ok=True)
    with open(os.path.join(args.output_data_dir, "training_history.json"), 'w') as f:
        json.dump(history, f, indent=2)
    with open(os.path.join(args.model_dir, "classes.json"), 'w') as f:
        json.dump({'classes': classes}, f, indent=2)
    
    print(f"\n📊 History saved to {args.output_data_dir}/training_history.json")
    print(f"📝 Classes saved to {args.model_dir}/classes.json")

if __name__ == "__main__":
    main()