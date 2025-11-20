from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('detect/', views.process_image, name='detect'),
    path('chat/', views.chat_with_image, name='chat'),
    path('me/', views.get_user_profile, name='me'),
]