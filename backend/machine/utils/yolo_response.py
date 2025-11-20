from ultralytics import YOLO
from django.conf import settings
import os
import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

# Load model once to save memory
model = YOLO("yolov8n.pt") 

def detect_objects(image_instance):
    """
    Runs YOLO detection on the uploaded image instance.
    Returns:
        - List of detection results (class, confidence, box)
        - ContentFile of the annotated image
    """
    # Get absolute path of the uploaded image
    source_path = image_instance.image.path
    
    # Run inference
    results = model(source_path)
    result = results[0] # We only process one image at a time

    # Process detections
    detections = []
    for box in result.boxes:
        # Extract data
        class_id = int(box.cls[0])
        class_name = result.names[class_id]
        confidence = float(box.conf[0])
        bbox = box.xyxy[0].tolist() # [x1, y1, x2, y2]
        
        # Round coordinates for cleaner display
        bbox = [int(x) for x in bbox]

        detections.append({
            "class": class_name,
            "confidence": round(confidence, 2),
            "box": bbox
        })

    # Generate Annotated Image
    # plot() returns a BGR numpy array
    annotated_array = result.plot() 
    
    # Convert BGR (OpenCV) to RGB (Pillow)
    annotated_array = cv2.cvtColor(annotated_array, cv2.COLOR_BGR2RGB)
    im_pil = Image.fromarray(annotated_array)

    # Save to buffer
    buffer = BytesIO()
    im_pil.save(buffer, format="JPEG")
    file_content = ContentFile(buffer.getvalue())

    return detections, file_content