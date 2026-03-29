# my-ai-coder

AI-powered code generator with authentication. Generate code using AI, save and manage your generated code snippets.

## Features

- 🤖 **AI Code Generation** - Describe what you want to build and let AI generate the code
- 💾 **Save & Manage** - Save generated code to your personal library
- 🔐 **Authentication** - Secure login/register with JWT tokens
- 📱 **Mobile-First UI** - Responsive design that works on all devices
- 🎨 **Modern UI/UX** - Dark theme with smooth animations

## Tech Stack

- **Frontend**: HTML, CSS (Panda.css), JavaScript
- **Backend**: Cloudflare Workers
- **Database**: Neon PostgreSQL
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js 18+
- Cloudflare account
- Neon database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.dev.vars` and configure:
   ```bash
   cp .env.example .dev.vars
   ```

4. Update `.dev.vars` with your credentials:
   ```
   DATABASE_URL=your-neon-connection-string
   JWT_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-key
   ```

### Development

Run locally:
```bash
npm run dev
```

### Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Project Structure

```
my-ai-coder/
├── index.html              # Main HTML file
├── public/
│   ├── css/style.css      # Additional styles
│   └── js/
│       ├── app.js         # Main application logic
│       └── auth.js        # Authentication UI
├── src/
│   ├── index.js           # Worker entry point
│   ├── routes/            # API routes
│   │   ├── generate.js    # Code generation
│   │   ├── save-code.js   # Save/get/delete codes
│   │   └── auth.js       # Login/register
│   ├── services/          # Business logic
│   │   ├── openhands.js  # AI service
│   │   ├── database.js  # Database service
│   │   └── jwt.js       # JWT service
│   └── utils/            # Utilities
│       ├── cors.js       # CORS middleware
│       └── auth.js      # Auth middleware
├── database/
│   └── schema.sql        # Database schema
├── wrangler.toml        # Cloudflare config
└── package.json         # Dependencies
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/generate` | Generate code from prompt |
| POST | `/save-code` | Save generated code (auth required) |
| GET | `/get-codes` | Get all saved codes (auth required) |
| GET | `/get-code/:id` | Get single code (auth required) |
| DELETE | `/delete-code/:id` | Delete code (auth required) |
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |

## License

MIT