# AI Coder - Smart Code Generator Platform

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered%20Code-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="AI Powered">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/Neon-Database-0e2f44?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon Database">
  <img src="https://img.shields.io/badge/Chat-AI%20Assistant-10b981?style=for-the-badge" alt="AI Chat">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

AI-powered code generator platform with modern UI/UX. Generate production-ready code from natural language, chat with AI assistant, and manage your code snippets with user authentication.

## ✨ Features

- 🤖 **AI Code Generation** - Describe what you want and let AI write the code
- 💬 **AI Chat Interface** - Ask questions, generate code via chat
- 📊 **Dashboard** - Track your code generation statistics
- 📚 **Documentation** - Full docs with search system
- 💾 **Code Management** - Save, view, copy, and delete codes
- 🔐 **User Authentication** - Login, Register, Password Reset
- 📱 **Mobile-First Design** - Responsive UI for all devices
- 🎨 **Modern UI/UX** - Dark theme, Lucide icons, smooth animations
- ⚡ **Fast Performance** - Built on Cloudflare Workers edge network

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Neon PostgreSQL database
- OpenAI API key

### Installation
```bash
git clone https://github.com/amkyawdev/my-ai-coder.git
cd my-ai-coder
npm install
```

### Configuration
```bash
cp .env.example .dev.vars
# Update .dev.vars with your credentials
```

### Development & Deployment
```bash
npm run dev    # Run locally
npm run deploy # Deploy to Cloudflare
```

## 📁 Pages

| Page | Description |
|------|-------------|
| **Generate** | Main code generator with AI |
| **Chat** | AI chatbot for code generation |
| **Dashboard** | User statistics & activity |
| **Docs** | Documentation with search |
| **Login** | User authentication |
| **Reset** | Password reset |

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Cloudflare Workers |
| Database | Neon PostgreSQL |
| Icons | Lucide |
| Auth | JWT |

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/generate` | Generate code from prompt | ❌ |
| POST | `/chat` | AI chat message | ❌ |
| POST | `/save-code` | Save generated code | ✅ |
| GET | `/get-codes` | Get all saved codes | ✅ |
| GET | `/get-code/:id` | Get single code | ✅ |
| DELETE | `/delete-code/:id` | Delete code | ✅ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/reset` | Password reset | ❌ |

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Single column, small menu |
| Desktop (≥768px) | Full navigation |

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection |
| `JWT_SECRET` | Secret key for JWT tokens |
| `OPENAI_API_KEY` | OpenAI API key |

## 📄 License

MIT License

---

<p align="center">Made with ❤️ by <a href="https://github.com/amkyawdev">amkyawdev</a></p>