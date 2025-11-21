from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .utils.yolo_response import detect_objects
from .utils.gemini_response import get_gemini_response
from .serializers import RegisterSerializer, UserSerializer, ImageAnalysisSerializer
from .models import UploadedImage


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    user = authenticate(username=user_obj.username, password=password)

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny]) # Or IsAuthenticated if you want to lock it down
def process_image(request):
    parser_classes = (MultiPartParser, FormParser)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Save original image
    image_instance = UploadedImage(image=request.FILES['image'])
    image_instance.save()

    try:
        # 2. Run YOLO detection
        detections, annotated_content = detect_objects(image_instance)

        # 3. Save results to database
        image_instance.detection_results = detections
        image_instance.annotated_image.save(
            f"annotated_{image_instance.id}.jpg", 
            annotated_content, 
            save=True
        )
        
        serializer = ImageAnalysisSerializer(image_instance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
@permission_classes([AllowAny])
def chat_with_image(request):
    image_id = request.data.get('image_id')
    question = request.data.get('question')

    if not image_id or not question:
        return Response(
            {'error': 'image_id and question are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Retrieve the image object
    image_instance = get_object_or_404(UploadedImage, id=image_id)
    
    try:
        # Call Gemini
        # We pass the raw file path of the original uploaded image
        response_text = get_gemini_response(
            image_instance.image.path,
            image_instance.detection_results,
            question
        )
        
        return Response({
            'answer': response_text
        })

    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)