from ultralytics import YOLO
from django.conf import settings
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO
from django.core.files.base import ContentFile

# Load model once to save memory
model = YOLO("yolov8n.pt") 

COLORS = [
    "#10b981", # Green
    "#2563eb", # Blue
    "#f59e0b", # Orange
    "#8b5cf6", # Purple
    "#ec4899"  # Pink
]

def detect_objects(image_instance):
    source_path = image_instance.image.path
    results = model(source_path)
    result = results[0]

    original_image = Image.open(source_path).convert("RGB")
    draw = ImageDraw.Draw(original_image)
    
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except:
        font = ImageFont.load_default()

    detections = []
    
    for i, box in enumerate(result.boxes):
        class_id = int(box.cls[0])
        class_name = result.names[class_id]
        confidence = float(box.conf[0])
        
        # Convert to integer percentage
        conf_int = int(confidence * 100) 
        
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        bbox = [int(x1), int(y1), int(x2), int(y2)]

        color = COLORS[i % len(COLORS)]

        # Draw Box
        draw.rectangle(bbox, outline=color, width=4)

        # Create Label
        label = f"{class_name} {conf_int}%"
        
        try:
            text_bbox = draw.textbbox((bbox[0], bbox[1]), label, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
        except AttributeError:
            text_width, text_height = draw.textsize(label, font=font)
        
        draw.rectangle(
            [bbox[0], bbox[1], bbox[0] + text_width + 10, bbox[1] + text_height + 10],
            fill=color
        )
        draw.text((bbox[0] + 5, bbox[1] + 5), label, fill="white", font=font)

        # --- CHANGE IS HERE ---
        # We save it as "49%" (String) instead of 49 (Int)
        # This ensures the AI Chat reads it with the percent symbol.
        detections.append({
            "class": class_name,
            "confidence": f"{conf_int}%", 
            "box": bbox
        })

    buffer = BytesIO()
    original_image.save(buffer, format="JPEG", quality=90)
    file_content = ContentFile(buffer.getvalue())

    return detections, file_content