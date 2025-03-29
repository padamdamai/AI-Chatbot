import requests
import os
import re  # Import regex module
from dotenv import load_dotenv
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import password_validation
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token  # Make sure to import Token

# Load environment variables from .env file
load_dotenv()

# Get OpenRouter API key from environment variables
API_KEY = os.getenv("OPENROUTER_API_KEY")

# Initialize OpenRouter API client (adjust based on your setup)
client = requests.Session()  # Use appropriate API client for OpenRouter
client.headers.update({"Authorization": f"Bearer {API_KEY}"})

class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this endpoint

    def post(self, request, *args, **kwargs):
        # Extract data from request
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirmPassword = request.data.get('confirmPassword')

        # Check if all fields are provided
        if not username or not email or not password or not confirmPassword:
            return Response({'error': 'All fields are required!'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password match
        if password != confirmPassword:
            return Response({'error': 'Passwords do not match!'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        try:
            password_validation.validate_password(password)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Check if username or email already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already in use!'}, status=status.HTTP_400_BAD_REQUEST)

        # Create new user
        user = User.objects.create_user(username=username, email=email, password=password)

        return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]  # Allow any user to access this endpoint

    def post(self, request):
        # Extract data from the request
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(username=username, password=password)

        # If authentication is successful
        if user is not None:
            # Generate or retrieve the authentication token
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {'message': 'Login successful!', 'token': token.key}, 
                status=status.HTTP_200_OK
            )
        else:
            # Return error if authentication fails
            return Response(
                {'error': 'Invalid username or password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ChatbotAPI(APIView):
    renderer_classes = [JSONRenderer]

    def post(self, request, *args, **kwargs):
        user_message = request.data.get('message')

        if not user_message:
            return Response({"error": "Message not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Call OpenRouter API (using DeepSeek model)
            response = client.post(
                "https://openrouter.ai/api/v1/chat/completions", 
                json={
                    "model": "deepseek/deepseek-r1-zero",  # DeepSeek model
                    "messages": [{"role": "user", "content": user_message}]
                }
            )
            # Check for successful response
            if response.status_code == 200:
                bot_reply = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')

                # Remove LaTeX \boxed{} formatting from the response
                bot_reply = re.sub(r'\\boxed{(.*?)}', r'\1', bot_reply)

                return Response({"response": bot_reply})

            else:
                return Response({"error": "Error from OpenRouter API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
