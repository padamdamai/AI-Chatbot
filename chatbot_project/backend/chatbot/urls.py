from django.urls import path
from .views import RegisterView, ChatbotAPI, LoginView

urlpatterns = [
    path('chat/', ChatbotAPI.as_view(), name='chatbot_api'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),  # Add this line
]
