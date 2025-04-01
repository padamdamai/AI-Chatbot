from django.urls import path
from .views import RegisterView, LoginView, ChatbotAPI,UserDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('chat/', ChatbotAPI.as_view(), name='chatbot'),
    path('user/', UserDetailView.as_view(), name='user-detail'),
]