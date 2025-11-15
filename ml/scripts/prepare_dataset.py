import os
import shutil
from pathlib import Path
from sklearn.model_selection import train_test_split
import random
from collections import defaultdict

# Set random seed for reproducibility
random.seed(42)

# Paths
RAW_DATA_DIR = Path("ml/data/raw")
PROCESSED_DATA_DIR = Path("ml/data/processed")
OXFORD_DIR = RAW_DATA_DIR / "images"
KAGGLE_DIR = RAW_DATA_DIR / "cat_breeds_refined" / "images"

# Output directories
TRAIN_DIR = PROCESSED_DATA_DIR / "train"
VAL_DIR = PROCESSED_DATA_DIR / "validation"

# Create output directories
TRAIN_DIR.mkdir(parents=True, exist_ok=True)
VAL_DIR.mkdir(parents=True, exist_ok=True)

# Oxford breed mapping (only cat breeds from Oxford dataset)
# Oxford format: "Abyssinian_100.jpg" -> breed is before underscore
OXFORD_CAT_BREEDS = [
    'Abyssinian', 'Bengal', 'Birman', 'Bombay', 
    'British_Shorthair', 'Egyptian_Mau', 'Maine_Coon', 
    'Persian', 'Ragdoll', 'Russian_Blue', 'Siamese', 'Sphynx'
]

def normalize_breed_name(breed):
    """Normalize breed names to consistent format"""
    return breed.replace('_', ' ').replace('-', ' ').title()

def collect_images():
    """Collect all images organized by breed"""
    breed_images = defaultdict(list)
    
    # Process Oxford dataset
    print("Processing Oxford-IIIT Pet Dataset...")
    if OXFORD_DIR.exists():
        for img_file in OXFORD_DIR.glob("*.jpg"):
            # Oxford format: "Abyssinian_100.jpg"
            breed = img_file.stem.rsplit('_', 1)[0]  # Get breed part before last underscore
            
            if breed in OXFORD_CAT_BREEDS:
                normalized_breed = normalize_breed_name(breed)
                breed_images[normalized_breed].append(img_file)
        
        print(f"  Found {sum(len(imgs) for imgs in breed_images.values())} cat images from Oxford dataset")
    
    # Process Kaggle dataset
    print("\nProcessing Kaggle Cat Breeds Refined Dataset...")
    if KAGGLE_DIR.exists():
        for breed_folder in KAGGLE_DIR.iterdir():
            if breed_folder.is_dir():
                breed = breed_folder.name
                normalized_breed = normalize_breed_name(breed)
                
                # Get all images from this breed folder
                images = list(breed_folder.glob("*.jpg")) + list(breed_folder.glob("*.jpeg")) + list(breed_folder.glob("*.png"))
                breed_images[normalized_breed].extend(images)
        
        print(f"  Found {sum(len(imgs) for imgs in breed_images.values())} total images from Kaggle dataset")
    
    return breed_images

def filter_breeds(breed_images, min_images=50):
    """Filter out breeds with too few images"""
    print(f"\nFiltering breeds with at least {min_images} images...")
    filtered = {
        breed: images 
        for breed, images in breed_images.items() 
        if len(images) >= min_images
    }
    
    removed = set(breed_images.keys()) - set(filtered.keys())
    if removed:
        print(f"  Removed {len(removed)} breeds with insufficient images:")
        for breed in sorted(removed):
            print(f"    - {breed}: {len(breed_images[breed])} images")
    
    print(f"\n  Kept {len(filtered)} breeds")
    return filtered

def split_and_copy_images(breed_images, train_ratio=0.8, val_ratio=0.2):
    """Split images into train/val and copy to appropriate directories"""
    print(f"\nSplitting dataset (train: {train_ratio*100}%, val: {val_ratio*100}%)...")
    
    stats = {
        'total_images': 0,
        'train_images': 0,
        'val_images': 0,
        'breeds': len(breed_images)
    }
    
    for breed, images in sorted(breed_images.items()):
        # Split images
        train_imgs, val_imgs = train_test_split(
            images, 
            train_size=train_ratio,
            test_size=val_ratio,
            random_state=42
        )
        
        # Create breed directories
        train_breed_dir = TRAIN_DIR / breed
        val_breed_dir = VAL_DIR / breed
        train_breed_dir.mkdir(exist_ok=True)
        val_breed_dir.mkdir(exist_ok=True)
        
        # Copy training images
        for idx, img_path in enumerate(train_imgs):
            dest = train_breed_dir / f"{breed}_{idx:04d}{img_path.suffix}"
            shutil.copy2(img_path, dest)
        
        # Copy validation images
        for idx, img_path in enumerate(val_imgs):
            dest = val_breed_dir / f"{breed}_val_{idx:04d}{img_path.suffix}"
            shutil.copy2(img_path, dest)
        
        stats['total_images'] += len(images)
        stats['train_images'] += len(train_imgs)
        stats['val_images'] += len(val_imgs)
        
        print(f"  {breed}: {len(images)} total ({len(train_imgs)} train, {len(val_imgs)} val)")
    
    return stats

def save_breed_mapping(breed_images):
    """Save breed index mapping for inference"""
    breeds = sorted(breed_images.keys())
    breed_to_idx = {breed: idx for idx, breed in enumerate(breeds)}
    
    mapping_file = PROCESSED_DATA_DIR / "breed_mapping.txt"
    with open(mapping_file, 'w') as f:
        for breed, idx in breed_to_idx.items():
            f.write(f"{idx}\t{breed}\n")
    
    print(f"\nBreed mapping saved to {mapping_file}")
    return breed_to_idx

def main():
    print("=" * 60)
    print("Cat Breed Dataset Preparation")
    print("=" * 60)
    
    # Step 1: Collect all images
    breed_images = collect_images()
    
    if not breed_images:
        print("\nERROR: No images found! Check your data directory structure.")
        return
    
    print(f"\nInitial statistics:")
    print(f"  Total breeds: {len(breed_images)}")
    print(f"  Total images: {sum(len(imgs) for imgs in breed_images.values())}")
    
    # Step 2: Filter breeds with insufficient images
    breed_images = filter_breeds(breed_images, min_images=50)
    
    # Step 3: Split and copy images
    stats = split_and_copy_images(breed_images, train_ratio=0.8, val_ratio=0.2)
    
    # Step 4: Save breed mapping
    breed_to_idx = save_breed_mapping(breed_images)
    
    # Print final statistics
    print("\n" + "=" * 60)
    print("Dataset Preparation Complete!")
    print("=" * 60)
    print(f"Total breeds: {stats['breeds']}")
    print(f"Total images: {stats['total_images']}")
    print(f"Training images: {stats['train_images']}")
    print(f"Validation images: {stats['val_images']}")
    print(f"\nDataset saved to:")
    print(f"  Train: {TRAIN_DIR}")
    print(f"  Validation: {VAL_DIR}")
    print("\nBreed distribution:")
    
    # Show breed distribution
    for breed in sorted(breed_images.keys()):
        count = len(breed_images[breed])
        bar = "█" * (count // 50)  # Visual bar
        print(f"  {breed:30s} {count:4d} {bar}")

if __name__ == "__main__":
    main()