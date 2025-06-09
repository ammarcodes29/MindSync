# MindSync - Student Study Planner

MindSync is an AI-powered study planner designed to enhance academic productivity through intelligent tracking, personalized analytics, and interactive dashboard features.

## Features

- User authentication system
- Interactive dashboard with study statistics
- Course management
- Assignment tracking
- Study session scheduling
- AI Assistant (Neura) for personalized study recommendations
- Dark/light mode toggle
- Progress tracking and analytics

## Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn UI components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with sessions
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Project Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- Git

### Setting Up the Local Environment

1. **Clone the repository**

```bash
git clone https://your-repo-url/mindsync.git
cd mindsync
```

2. **Copy the configuration files**

```bash
# Copy package.json
cp local-package.json package.json

# Copy Vite configuration
cp local-vite.config.ts vite.config.ts

# Copy database configuration
cp local-db.ts server/db.ts

# Copy server index file
cp local-server-index.ts server/index.ts

# Copy drizzle configuration
cp local-drizzle.config.ts drizzle.config.ts

# Create environment file
cp .env.example .env
```

3. **Configure environment variables**

Edit the `.env` file and set up your database connection string and other variables:

```
DATABASE_URL=postgres://username:password@localhost:5432/mindsync
SESSION_SECRET=your_random_secure_string
PORT=5000
NODE_ENV=development
```

4. **Install dependencies**

```bash
npm install
```

5. **Set up the database**

Create a PostgreSQL database and run migrations:

```bash
# Create the database (using psql)
psql -U postgres -c "CREATE DATABASE mindsync;"

# Run database migrations
npm run db:push
```

### Running the Application

1. **Development mode**

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately
npm run dev:client  # Frontend on port 3000
npm run dev:server  # Backend on port 5000
```

2. **Production build**

```bash
# Build the app
npm run build

# Start in production mode
npm start
```

### Database Management

- **Push schema changes**: `npm run db:push`
- **Generate migrations**: `npm run db:generate`
- **Apply migrations**: `npm run db:migrate`
- **Open Drizzle Studio**: `npm run db:studio`

## Project Structure

```
mindsync/
├── client/               # Frontend code
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Entry point
│   └── index.html        # HTML template
├── server/               # Backend code
│   ├── db.ts             # Database configuration
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and types
├── attached_assets/      # Static assets
├── migrations/           # Database migrations
├── .env                  # Environment variables
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite bundler configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Happy studying with MindSync! 📚