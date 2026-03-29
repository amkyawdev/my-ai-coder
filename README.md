# AI Coder - Smart Code Generator Platform

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered%20Code-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="AI Powered">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-f38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers">
  <img src="https://img.shields.io/badge/Neon-Database-0e2f44?style=for-the-badge&logo=postgresql&logoColor=white" alt="Neon Database">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

AI-powered code generator with modern UI/UX. Generate production-ready code from natural language descriptions, save and manage your code snippets with user authentication.

## ✨ Features

- 🤖 **AI Code Generation** - Describe what you want to build and let AI write the code
- 💾 **Code Management** - Save, view, copy, and delete your generated code
- 🔐 **User Authentication** - Secure JWT-based login and registration
- 📱 **Mobile-First Design** - Responsive UI that works on all devices
- 🎨 **Modern UI/UX** - Dark theme with Lucide icons and smooth animations
- ⚡ **Fast Performance** - Built on Cloudflare Workers edge network

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Cloudflare account
- Neon PostgreSQL database
- OpenAI API key (optional, for AI generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/amkyawdev/my-ai-coder.git
cd my-ai-coder

# Install dependencies
npm install
```

### Configuration

1. Copy the environment file:
```bash
cp .env.example .dev.vars
```

2. Update `.dev.vars` with your credentials:
```bash
DATABASE_URL=postgresql://user:password@host/neondb
JWT_SECRET=your-secret-key-min-32-chars
OPENAI_API_KEY=sk-...
```

### Development

```bash
# Run locally
npm run dev
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Cloudflare Workers |
| Database | Neon PostgreSQL |
| Icons | Lucide |
| Auth | JWT |

## 📁 Project Structure

```
my-ai-coder/
├── index.html                    # Main HTML file
├── public/
│   ├── css/style.css            # Additional styles
│   └── js/
│       ├── app.js               # Main application logic
│       └── auth.js              # Authentication UI
├── src/
│   ├── index.js                 # Worker entry point
│   ├── routes/
│   │   ├── generate.js          # Code generation endpoint
│   │   ├── save-code.js         # Save/get/delete codes
│   │   └── auth.js              # Login/register handlers
│   ├── services/
│   │   ├── openhands.js         # AI service (OpenAI)
│   │   ├── database.js          # Database connection
│   │   └── jwt.js               # JWT authentication
│   └── utils/
│       ├── cors.js              # CORS middleware
│       ├── auth.js              # Auth middleware
│       └── validation.js       # Input validation
├── database/
│   └── schema.sql               # Database schema
├── wrangler.toml                # Cloudflare config
└── package.json                 # Dependencies
```

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|--------------|------|
| POST | `/generate` | Generate code from prompt | ❌ |
| POST | `/save-code` | Save generated code | ✅ |
| GET | `/get-codes` | Get all saved codes | ✅ |
| GET | `/get-code/:id` | Get single code | ✅ |
| DELETE | `/delete-code/:id` | Delete code | ✅ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/register` | User registration | ❌ |

## 🎨 UI Components

- **Header** - Logo, navigation links, user section
- **Hero Section** - Badge, title, description
- **Code Generator** - Prompt input, language/framework selection
- **Output Section** - Code display, copy/save buttons
- **Saved Codes** - List of saved code items
- **Auth Modal** - Login/register forms with tabs

## 📱 Responsive Design

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 768px | Single column, hamburger menu |
| Tablet | 768px - 1024px | Adaptive navigation |
| Desktop | > 1024px | Full navigation, wider content |

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for code generation | ❌ |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">Made with ❤️ by <a href="https://github.com/amkyawdev">amkyawdev</a></p>