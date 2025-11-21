FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install minimal system dependencies
# We use --no-install-recommends to keep the image small
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# --- CRITICAL OPTIMIZATION ---
# 1. Install CPU-only PyTorch first.
# This prevents 'ultralytics' from downloading the massive 3GB NVIDIA version.
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 2. Copy requirements (Make sure 'torch' is REMOVED from this file)
COPY requirements.txt .

# 3. Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Command to run
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]