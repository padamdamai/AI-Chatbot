from django.urls import path
from .views import RegisterView, LoginView, ChatbotAPI

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('chat/', ChatbotAPI.as_view(), name='chatbot'),
]