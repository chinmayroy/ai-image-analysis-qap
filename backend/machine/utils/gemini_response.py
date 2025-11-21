import google.generativeai as genai
from django.conf import settings
import os
import PIL.Image

# Configure the API key
genai.configure(api_key=settings.GEMINI_API_KEY)

def get_gemini_response(image_path, detection_results, user_question):
    """
    Sends the image, detection data, and user question to Gemini.
    """
    
    # 1. Define prompt globally so it is available for fallbacks
    context_text = f"""
    You are an AI assistant analyzing an image.
    
    Here is the structured object detection data (YOLO) for this image:
    {detection_results}
    
    Please answer the following question from the user based on BOTH the visual image 
    and the provided detection data. Be concise and helpful.
    
    User Question: {user_question}
    """

    try:
        # 2. Try the Flash model (Fastest)
        print("Attempting to use gemini-flash-latest...")
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Upload file using the File API
        sample_file = genai.upload_file(path=image_path, display_name="User Image")

        response = model.generate_content([sample_file, context_text])
        return response.text

    except Exception as e:
        print(f"Flash model failed: {e}. Switching to Fallback...")
        
        try:
            print("Attempting to use gemini-pro-latest...")
            model = genai.GenerativeModel('gemini-pro-latest')
            
            # Upload file for Pro as well
            sample_file = genai.upload_file(path=image_path, display_name="User Image")
            
            response = model.generate_content([sample_file, context_text])
            return response.text
            
        except Exception as final_error:
            try:
                print("Image models failed. Trying text-only gemini-pro...")
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(f"{context_text}\n[Note: Image analysis failed, answering based on YOLO data only]")
                return response.text
            except:
                return f"AI Error: {str(e)} | Fallback Error: {str(final_error)}"