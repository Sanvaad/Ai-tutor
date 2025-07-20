# AI Tutor - Next.js + Supabase

A sophisticated educational platform powered by Google's Gemini AI, featuring specialized agents for Math, Physics, Chemistry, and History tutoring with integrated computational tools and persistent chat sessions.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [AI Agents](#ai-agents)
- [Migration from Previous Version](#migration-from-previous-version)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **Multi-Agent System**: Specialized AI agents for different subjects (Math, Physics, Chemistry, History)
- **Session Management**: Persistent chat history with Supabase database
- **Real-time Chat**: Interactive learning conversations with typing indicators
- **Mathematics Support**: LaTeX-style math rendering and equation display
- **Physics Constants**: Built-in physics constants lookup with fuzzy matching
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes with persistence
- **Smart Routing**: Intelligent query delegation to appropriate specialist agents
- **Modern UI**: Beautiful interface with smooth animations and transitions

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini AI (2.0 Flash)
- **Styling**: Tailwind CSS, Shadcn/UI components
- **Animations**: Framer Motion
- **State Management**: React hooks
- **Authentication**: Supabase Auth (ready for future implementation)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-tutor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Fill in the required environment variables:

```env
# Google AI API Key
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Supabase Setup

#### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Start local Supabase:
```bash
npm run supabase:start
```

3. Apply migrations:
```bash
supabase db reset
```

#### Option B: Using Supabase Dashboard

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the migration script from `supabase/migrations/001_initial_schema.sql`

### 5. Get API Keys

#### Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` file

#### Supabase Keys

1. Go to your Supabase project settings
2. Navigate to API settings
3. Copy the Project URL and anon/public key
4. Add them to your `.env.local` file

### 6. Run the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate TypeScript types from Supabase schema
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase

## 🗄️ Database Schema

The application uses the following tables:

- **chat_sessions**: Stores chat session metadata (id, title, created_at, updated_at, user_id)
- **messages**: Stores individual messages with role, content, and agent_type

## 🤖 AI Agents

The system includes specialized agents for different subjects:

- **MathAgent**: Handles arithmetic, algebra, calculus, equations, statistics
- **PhysicsAgent**: Covers force, motion, energy, mass, velocity, Newton's laws, includes physics constants lookup
- **ChemistryAgent**: Deals with atoms, molecules, reactions, periodic table
- **HistoryAgent**: Covers historical events, timelines, famous leaders, civilizations
- **TutorAgent**: Routes queries to appropriate specialized agents using intelligent classification

## 🔄 Migration from Previous Version

If you're migrating from the previous Flask-based version:

1. The application will automatically detect and load existing chat data from localStorage
2. New chats will be saved to Supabase for persistence
3. All AI agents have been migrated to TypeScript and integrated into Next.js API routes
4. The backend Flask server is no longer needed

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_AI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js applications. Make sure to:

1. Set up environment variables
2. Ensure your Supabase project is configured correctly
3. Build the application with `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Google AI** for providing the Gemini API
- **Supabase** for the excellent database platform
- **Vercel** for hosting capabilities
- **shadcn/ui** for beautiful UI components
- **Next.js** community for excellent documentation

## 📞 Support

For issues and questions:
1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🔒 Security

- Never commit API keys or sensitive information
- Use environment variables for all configuration
- Follow security best practices for authentication
- Report security vulnerabilities privately

---

Built with ❤️ using Next.js, Supabase, and Google AI.
