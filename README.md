# PadamNova

PadamNova is a modern AI-powered chatbot platform built using React, Vite, Django REST Framework, and OpenRouter API.
It supports authentication, Markdown rendering, LaTeX mathematical formatting, smart AI responses, and responsive UI design.

---

# 🚀 Features

* 🤖 AI-powered chatbot using OpenRouter API
* 🔐 User authentication system (Signup/Login)
* 🧠 Smart response formatting
* 📝 Markdown rendering support
* 📐 LaTeX math equation rendering
* 📋 Numbered lists & formatted responses
* 💻 Code block rendering
* 📱 Fully responsive design
* ⚡ Fast frontend powered by Vite
* 🔄 Token-based authentication with Django REST Framework

---

# 🛠️ Tech Stack

## Frontend

* React
* Vite
* Bootstrap 5
* Axios
* React Markdown
* KaTeX

## Backend

* Django
* Django REST Framework
* SQLite
* Python

## AI Integration

* OpenRouter API
* Gemma / Llama / DeepSeek models

---

# 📸 Screenshots

## Homepage

--- <img width="1919" height="932" alt="homepage" src="https://github.com/user-attachments/assets/9966facc-00f2-4b03-9180-465327640495" />


## Signup Page

---<img width="1919" height="932" alt="signup" src="https://github.com/user-attachments/assets/46c5fc60-8676-4672-b8ee-80688baec5f1" />


## Login Page

--- <img width="1919" height="932" alt="login" src="https://github.com/user-attachments/assets/3e124007-43ba-4577-9f3c-b35da1fcb0cc" />


## Welcome Screen

--- <img width="1919" height="932" alt="welcomepg" src="https://github.com/user-attachments/assets/3b089e67-6a58-4b82-a12d-700e16253937" />


## Chat Interface

--- <img width="1919" height="932" alt="chat" src="https://github.com/user-attachments/assets/052f35bc-e703-431e-98da-00c6c0ab2fb3" />


# 📂 Project Structure

```bash
chatbot_project/
│
├── backend/
│   ├── chatbot_project/
│   ├── api/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Backend Setup

## Clone Repository

```bash
git clone git@github.com:padamdamai/padamnova.git
```

```bash
cd padamnova/backend
```

---

## Create Virtual Environment

### Linux / Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Create .env File

```env
DJANGO_SECRET_KEY=your_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

## Run Migrations

```bash
python manage.py migrate
```

---

## Start Backend Server

```bash
python manage.py runserver
```

---

# 💻 Frontend Setup

```bash
cd ../frontend
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Frontend

```bash
npm run dev
```

---

# 📐 Markdown & Math Rendering

PadamNova supports:

* Markdown formatting
* Syntax-highlighted code blocks
* Mathematical equations using LaTeX
* Numbered steps and lists

Example:

```
def say_hello():
    """Function to print a greeting message."""
    print("Hello, World!")

# Calling the function
say_hello()
```

---

# 🔑 Environment Variables

## Backend `.env`

```env
DJANGO_SECRET_KEY=your_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

# 🌟 Future Improvements

* Chat history storage
* Multiple AI model selection
* Voice input support
* Image generation support
* Streaming AI responses
* Dark mode
* Docker deployment

---

# 👨‍💻 Author

## Padam Damai

* GitHub: https://github.com/padamdamai

---

# 📜 License

This project is licensed under the MIT License.
