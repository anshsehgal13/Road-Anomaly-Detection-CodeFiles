import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import efficientnet_b3
from PIL import Image
import json
import os

# ==========================
# CLASS NAMES
# ==========================
CLASS_NAMES = {
    0: 'Drain Hole',
    1: 'Pothole',
    2: 'Sewer Cover',
    3: 'Unpaved Road',
    4: 'Wet Surface'
}

# ==========================
# CBAM BLOCK
# ==========================
class ChannelAttention(nn.Module):
    def __init__(self, in_channels, reduction_ratio=16):
        super(ChannelAttention, self).__init__()
        self.avg_pool = nn.AdaptiveAvgPool2d(1)
        self.max_pool = nn.AdaptiveMaxPool2d(1)
        self.fc = nn.Sequential(
            nn.Conv2d(in_channels, in_channels // reduction_ratio, 1, bias=False),
            nn.ReLU(),
            nn.Conv2d(in_channels // reduction_ratio, in_channels, 1, bias=False)
        )
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = self.fc(self.avg_pool(x))
        max_out = self.fc(self.max_pool(x))
        return self.sigmoid(avg_out + max_out)


class SpatialAttention(nn.Module):
    def __init__(self, kernel_size=7):
        super(SpatialAttention, self).__init__()
        self.conv = nn.Conv2d(2, 1, kernel_size, padding=(kernel_size - 1) // 2, bias=False)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        avg_out = torch.mean(x, dim=1, keepdim=True)
        max_out, _ = torch.max(x, dim=1, keepdim=True)
        x = torch.cat([avg_out, max_out], dim=1)
        return self.sigmoid(self.conv(x))


class CBAM(nn.Module):
    def __init__(self, in_channels, reduction_ratio=16, kernel_size=7):
        super(CBAM, self).__init__()
        self.channel_attention = ChannelAttention(in_channels, reduction_ratio)
        self.spatial_attention = SpatialAttention(kernel_size)

    def forward(self, x):
        x = x * self.channel_attention(x)
        x = x * self.spatial_attention(x)
        return x


# ==========================
# MODEL DEFINITION
# ==========================
class EfficientNetAnomalyDetector(nn.Module):
    def __init__(self, num_classes=5, use_cbam=True):
        super(EfficientNetAnomalyDetector, self).__init__()
        self.backbone = efficientnet_b3(pretrained=False)
        in_features = self.backbone.classifier[1].in_features

        self.use_cbam = use_cbam
        if use_cbam:
            self.cbam = CBAM(in_channels=1536, reduction_ratio=16, kernel_size=7)

        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 1024),
            nn.BatchNorm1d(1024),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(1024, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        if self.use_cbam:
            x = self.backbone.features(x)
            x = self.cbam(x)
            x = self.backbone.avgpool(x)
            x = torch.flatten(x, 1)
            x = self.backbone.classifier(x)
        else:
            x = self.backbone(x)
        return x


# ==========================
# TRANSFORMS
# ==========================
def get_val_transform():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])


# ==========================
# LOAD MODEL
# ==========================
def load_model(device):
    """
    Loads the EfficientNetAnomalyDetector model with trained weights.
    The model file is expected at backend/model/best_road_anomaly_model_5class.pth
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model", "best_road_anomaly_model_5class.pth")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"❌ Model file not found at: {model_path}")

    print(f"✅ Loading model from: {model_path}")

    model = EfficientNetAnomalyDetector(num_classes=5, use_cbam=True)

    checkpoint = torch.load(model_path, map_location=device)
    # Handle both cases: checkpoint is full dict or only model_state_dict
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model = model.to(device)
    model.eval()
    print("✅ Model loaded successfully and set to eval mode.")
    return model


# ==========================
# PREDICT IMAGE
# ==========================
def predict_image(image_path, model, device):
    transform = get_val_transform()
    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        _, predicted = torch.max(outputs, 1)

    predicted_class = predicted.item()
    confidence = probabilities[0][predicted_class].item()
    all_probs = {CLASS_NAMES[i]: round(probabilities[0][i].item(), 3) for i in range(5)}

    return {
        "predicted_class": predicted_class,
        "predicted_label": CLASS_NAMES[predicted_class],
        "confidence": round(confidence, 3),
        "all_probabilities": all_probs
    }


# ==========================
# TEST RUN
# ==========================
if __name__ == "__main__":
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    test_image = os.path.join(os.path.dirname(__file__), "uploads", "sample.jpg")

    if os.path.exists(test_image):
        model = load_model(device)
        result = predict_image(test_image, model, device)
        print(json.dumps(result, indent=2))
    else:
        print("⚠️ Sample image not found. Place one in the uploads/ folder.")
