import requests
import os
import re

from dotenv import load_dotenv

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import password_validation

load_dotenv()


# ==========================================
# REGISTER API
# ==========================================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):

        required_fields = [
            'username',
            'email',
            'password',
            'confirmPassword'
        ]

        if not all(request.data.get(field) for field in required_fields):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirmPassword')

        # Password match
        if password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Password validation
        try:
            password_validation.validate_password(password)

        except Exception as e:
            return Response(
                {'error': '\n'.join(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Username exists
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Email exists
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Email already in use'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_active=True
            )

            # Create token
            token = Token.objects.create(user=user)

            return Response({
                'message': 'User registered successfully',
                'username': user.username,
                'email': user.email,
                'token': token.key
            }, status=status.HTTP_201_CREATED)

        except Exception as e:

            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ==========================================
# LOGIN API
# ==========================================
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

            user = authenticate(
                username=username,
                password=password
            )

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
                {'error': str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )


# ==========================================
# CHATBOT API
# ==========================================
class ChatbotAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_message = request.data.get('message')

        if not user_message:
            return Response(
                {'error': 'Message is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ==========================================
        # DETECT REQUEST TYPE
        # ==========================================
        list_keywords = [
            "list",
            "points",
            "bullets",
            "steps",
            "numbered"
        ]

        math_keywords = [
            "solve",
            "calculate",
            "equation",
            "math",
            "+",
            "-",
            "*",
            "/",
            "^",
            "="
        ]

        is_list_request = any(
            keyword in user_message.lower()
            for keyword in list_keywords
        )

        is_math_request = any(
            keyword in user_message.lower()
            for keyword in math_keywords
        ) or re.search(
            r'\d+[\+\-\*\/\^=]\d+',
            user_message
        )

        try:

            # ==========================================
            # PROMPT ENHANCEMENT
            # ==========================================
            enhanced_prompt = user_message

            # List request
            if is_list_request:

                enhanced_prompt = f"""
{user_message}

Rules:
- Use Markdown formatting
- Use numbered lists
- Keep proper spacing
- Make response clean and readable
"""

            # Math request
            elif is_math_request:

                enhanced_prompt = f"""
Explain this math problem step by step:

{user_message}

Rules:
- Use Markdown formatting
- Use headings
- Use numbered lists
- Use LaTeX equations
- Use $$ for block equations
- Use $ for inline equations
- Clearly explain every step
"""

            # General request
            else:

                enhanced_prompt = f"""
{user_message}

Rules:
- Use Markdown formatting
- Use proper spacing
- Use headings if needed
- Keep response clean and readable
"""

            # ==========================================
            # WORKING MODEL
            # ==========================================
            model_name = "google/gemma-4-31b-it:free"

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",

                headers={
                    "Authorization":
                        f"Bearer {os.getenv('OPENROUTER_API_KEY')}",

                    "HTTP-Referer":
                        request.build_absolute_uri('/'),

                    "X-Title":
                        "TAKE IT EASY"
                },

                json={
                    "model": model_name,

                    "messages": [
                        {
                            "role": "user",
                            "content": enhanced_prompt
                        }
                    ]
                },

                timeout=30
            )

            print("MODEL:", model_name)
            print("STATUS CODE:", response.status_code)

            # ==========================================
            # HANDLE RATE LIMIT
            # ==========================================
            if response.status_code == 429:

                return Response(
                    {
                        'response': (
                            "⚠️ Free AI model is currently busy.\n\n"
                            "Please wait 20-30 seconds and try again."
                        ),
                        'format': 'text'
                    },
                    status=status.HTTP_200_OK
                )

            # ==========================================
            # HANDLE OTHER FAILURES
            # ==========================================
            if response.status_code != 200:

                print("FAILED:", response.text)

                return Response(
                    {
                        'response': (
                            "⚠️ AI service temporarily unavailable.\n\n"
                            "Please try again later."
                        ),
                        'format': 'text'
                    },
                    status=status.HTTP_200_OK
                )

            # ==========================================
            # RESPONSE JSON
            # ==========================================
            response_data = response.json()

            # SAFE RESPONSE EXTRACTION
            bot_reply = response_data.get(
                'choices',
                [{}]
            )[0].get(
                'message',
                {}
            ).get(
                'content',
                'No response generated.'
            )

            return Response({
                'response': bot_reply,

                'format': (
                    'math'
                    if is_math_request
                    else (
                        'list'
                        if is_list_request
                        else 'text'
                    )
                )
            })

        # ==========================================
        # TIMEOUT ERROR
        # ==========================================
        except requests.exceptions.Timeout:

            return Response(
                {
                    'response': 'Request timeout. Please try again.',
                    'format': 'text'
                },
                status=status.HTTP_200_OK
            )

        # ==========================================
        # REQUEST ERROR
        # ==========================================
        except requests.exceptions.RequestException as e:

            print("REQUEST ERROR:", str(e))

            return Response(
                {
                    'response': f'Chatbot service error: {str(e)}',
                    'format': 'text'
                },
                status=status.HTTP_200_OK
            )

        # ==========================================
        # GENERAL ERROR
        # ==========================================
        except Exception as e:

            print("GENERAL ERROR:", str(e))

            return Response(
                {
                    'response': str(e),
                    'format': 'text'
                },
                status=status.HTTP_200_OK
            )


# ==========================================
# USER DETAIL API
# ==========================================
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        return Response({
            'username': user.username,
            'email': user.email
        })