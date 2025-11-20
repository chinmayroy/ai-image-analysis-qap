import google.generativeai as genai
from django.conf import settings
import os

# Configure the API key
genai.configure(api_key=settings.GEMINI_API_KEY)

def get_gemini_response(image_path, detection_results, user_question):
    """
    Sends the image, detection data, and user question to Gemini.
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Load the image file
        # validation is handled in views, so we assume path exists here
        sample_file = genai.upload_file(path=image_path, display_name="User Image")

        # Construct a structured system prompt
        # We embed the YOLO results as text context
        context_text = f"""
        You are an AI assistant analyzing an image.
        
        Here is the structured object detection data (YOLO) for this image:
        {detection_results}
        
        Please answer the following question from the user based on BOTH the visual image 
        and the provided detection data. Be concise and helpful.
        
        User Question: {user_question}
        """

        # Generate content
        response = model.generate_content([sample_file, context_text])
        
        return response.text

    except Exception as e:
        return f"AI Error: {str(e)}"