import requests
import os
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import password_validation
import re

load_dotenv()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        required_fields = ['username', 'email', 'password', 'confirmPassword']
        if not all(request.data.get(field) for field in required_fields):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirmPassword')

        if password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            password_validation.validate_password(password)
        except Exception as e:
            return Response(
                {'error': '\n'.join(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already in use'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True
            )
            Token.objects.create(user=user)
            return Response({
                'message': 'User registered successfully',
                'username': user.username,
                'email': user.email,
                'token': Token.objects.get(user=user).key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Both username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = authenticate(username=username, password=password)
            
            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user_id': user.pk,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': 'Authentication service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

class ChatbotAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Detect request type
        list_keywords = ["list", "points", "bullets", "steps", "numbered"]
        math_keywords = ["solve", "calculate", "equation", "math", "+", "-", "*", "/", "^", "="]
        
        is_list_request = any(keyword in user_message.lower() for keyword in list_keywords)
        is_math_request = any(
            keyword in user_message.lower() for keyword in math_keywords
        ) or re.search(r'\d+[\+\-\*\/\^=]\d+', user_message)

        try:
            # Enhance prompt based on request type
            enhanced_prompt = user_message
            if is_list_request:
                enhanced_prompt = f"{user_message}\n\nProvide the response as a clear numbered list with each point on a new line."
            elif is_math_request:
                enhanced_prompt = f"Explain how to solve this problem step by step with proper mathematical reasoning: {user_message}\n\nPresent the solution with each step clearly numbered and explained."

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                    "HTTP-Referer": request.build_absolute_uri('/'),
                    "X-Title": "Django Chatbot"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": enhanced_prompt}]
                }
            )
            response.raise_for_status()
            response_data = response.json()
            bot_reply = response_data['choices'][0]['message']['content']

            return Response({
                'response': bot_reply,
                'format': 'math' if is_math_request else ('list' if is_list_request else 'text')
            })

        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Chatbot service error: {str(e)}'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'email': user.email
        })