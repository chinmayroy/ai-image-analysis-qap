from django.contrib.auth.models import User
from rest_framework import serializers

from .models import UploadedImage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
            
        return data

    def create(self, validated_data):
        full_name = validated_data['full_name']
        names = full_name.strip().split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ''

        base_username = (first_name + last_name).lower()
        base_username = ''.join(e for e in base_username if e.isalnum())
        
        username = base_username
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{random.randint(1000, 9999)}"
            
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        return user


class ImageAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ['id', 'image', 'annotated_image', 'detection_results', 'uploaded_at']
        read_only_fields = ['annotated_image', 'detection_results', 'uploaded_at']