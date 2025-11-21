# AI Image Analysis & Q&A Platform

A full-stack AI web application that allows users to upload images, perform real-time object detection using **YOLOv8**, and interact with the results through a conversational AI interface powered by **Google Gemini 2.5 Flash**.

## 🚀 Features

* **Secure Authentication**: User Login and Signup functionality using token-based auth.
* **Object Detection**: Local execution of the YOLOv8 model to detect objects, draw bounding boxes, and calculate confidence scores.
* **Interactive Results**: A sortable data table displaying detected objects, confidence levels, and coordinates.
* **AI-Powered Q&A**: A chat interface where users can ask natural language questions about the image (e.g., "How many cars are there?"), powered by Gemini AI contextually aware of the detection results.
* **Responsive UI**: A modern, clean interface built with Next.js and Tailwind CSS.

## 🛠 Technical Architecture

This project is containerized using Docker and consists of two main services:

1.  **Backend (Django REST Framework)**:
    * Handles user authentication and data management.
    * Runs the YOLOv8 model locally using `ultralytics` to process images.
    * Integrates with Google's Generative AI SDK to send image context + detection data to Gemini.
    * Uses SQLite for data persistence (simplifying local setup).

2.  **Frontend (Next.js 14 + TypeScript)**:
    * Provides a responsive UI styled with Tailwind CSS.
    * Communicates with the backend via Axios.
    * Manages state for image previews, sortable tables, and chat history.

## 📋 Prerequisites

* **Docker** and **Docker Compose** installed on your machine.
* A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey)).

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/chinmayroy/ai-image-analysis-qap.git
    cd ai-image-analysis-qap
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root directory (Inside backend folder) and add your secrets:
    ```properties
    # --- Backend Secrets ---
    SECRET_KEY=your_django_secret_key_here
    GEMINI_API_KEY=your_google_gemini_api_key_here
    DEBUG=True
    ALLOWED_HOSTS=backend,localhost,127.0.0.1
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory (Inside frontend folder) and add your secrets:
    ```properties
    # --- Frontend Configuration ---
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    ```

4.  **Build and Run with Docker**
    Run the following command to build the images and start the containers:
    ```bash
    docker compose up --build
    ```

    *Note: The first run may take a few minutes as it downloads the necessary Docker images and the YOLOv8 model weights.*

5.  **Access the Application**
    * **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
    * **Backend API**: Running at [http://localhost:8000/machine/api/](http://localhost:8000/machine/api/).

## 🧪 Usage Guide

1.  **Sign Up**: Create a new account on the home page.
2.  **Upload**: Go to the dashboard and upload an image (JPG/PNG).
3.  **Detect**: Click the "Detect Objects" button. The system will process the image and display:
    * An annotated image with bounding boxes.
    * A table listing all detected objects (click headers to sort).
4.  **Ask**: Use the chat box on the right to ask questions like:
    * *"What is the most confident object?"*
    * *"Describe the layout of the objects."*

## 📂 Project Structure

```text
ai-image-analysis-qap/
├── backend/                 # Django Project
│   ├── machine/                 # Core Logic (Views, Models, Serializers)
│   ├── config/              # Project Settings
│   ├── media/               # Stores uploaded/annotated images
│   └── Dockerfile           # Backend container config
│   └── .env                     # Environment variables
├── frontend/                # Next.js Project
│   ├── src/
│   │   ├── app/             # Pages (Login, Dashboard)
│   │   ├── utils/           # API helpers
│   └── Dockerfile           # Frontend container config
│   └── .env                     # Environment variables
└── docker-compose.yml       # Orchestration