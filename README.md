# AIChatHub

**AIChatHub** is an AI-powered chatbot with authentication, built using React for the frontend and Django for the backend, powered by OpenAI's GPT-4 API through OpenRouter.
![homepage](https://github.com/user-attachments/assets/81f8046d-85a4-46a4-8b01-54e0facff2a9)



## ✨ Features

- **GPT-4 Powered** via OpenRouter API
- **User Authentication** (Signup/Login with JWT tokens)
- **Real-time Chat Interface**
- **Smart Response Formatting**:
  - Code snippets with proper HTML formatting
  - Numbered lists
  - Math solutions with step-by-step explanations
- **Responsive Design** works on all devices

## 🛠️ Tech Stack

**Frontend**  
▸ React 18  
▸ Bootstrap 5  
▸ Axios  

**Backend**  
▸ Django 5  
▸ Django REST Framework  
▸ SQLite (dev) / PostgreSQL (prod-ready)  

**AI Integration**  
▸ OpenRouter API (GPT-4)  

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Backend Setup
```bash
# Clone repository
git clone git@github.com:padamdamai/AIChatHub.git
cd AIChatHub/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "DJANGO_SECRET_KEY=your-secret-key-here" > .env
echo "OPENROUTER_API_KEY=your-openrouter-key" >> .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
