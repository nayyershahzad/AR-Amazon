# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DebtWise is an AI-powered debt payoff strategy advisor that combines conversational AI debt analysis, psychology-based rewards, smart automation, and banking integration. The project is designed as a comprehensive fintech application that helps users manage and pay off debt through personalized strategies and gamification.

## Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **AI**: Google Agent Development Kit (ADK/Genkit) with Gemini Flash
- **Database**: PostgreSQL (Prisma ORM)
- **Banking Integration**: Flink API for secure bank account connectivity
- **Frontend**: React with TypeScript (in `client/` directory)
- **Real-time**: Socket.io for live updates
- **Payments**: Stripe for reward payouts
- **Scheduling**: node-cron for automated payments
- **Testing**: Jest with ts-jest
- **Validation**: Zod schemas

## Development Commands

```bash
# Development (runs both backend and frontend concurrently)
npm run dev

# Backend only
npm run dev:backend

# Frontend only (from root)
npm run dev:frontend

# Build
npm run build                # Build both backend and frontend
npm run build:backend        # Backend only
npm run build:frontend       # Frontend only

# Start production server
npm start

# Testing
npm test                     # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage

# Code quality
npm run lint                # ESLint
npm run typecheck          # TypeScript checking

# Database (Prisma)
npm run db:migrate         # Run database migrations
npm run db:generate        # Generate Prisma client

# Google Genkit
npm run genkit:start       # Start Genkit development server
```

## Project Structure

```
src/
├── agent/              # Google Genkit flows and AI logic
│   ├── debtAdvisor.ts  # Main debt analysis flow
│   └── genkit.config.ts
├── handlers/           # Express route handlers
│   ├── debtHandler.ts
│   ├── rewardHandler.ts
│   └── automationHandler.ts
├── routes/             # API route definitions
│   ├── debtRoutes.ts
│   ├── rewardRoutes.ts
│   └── [other feature routes]
├── services/           # Business logic and external integrations
│   ├── socialService.ts
│   └── [other services]
├── types/              # TypeScript interfaces
│   ├── debt.ts         # Core debt and user types
│   └── [feature-specific types]
├── test/               # Test files
│   ├── debtAnalysis.test.ts
│   ├── setup.ts
│   └── testData.ts
└── server.ts           # Main Express server with Socket.io
client/                 # React frontend (separate package)
├── src/
│   └── components/     # React components for each feature
│       ├── DebtAnalyzer.tsx
│       ├── RewardDashboard.tsx
│       └── [other dashboards]
└── package.json
```

## Core Architecture

### AI Agent System
The application uses Google Genkit flows for conversational AI:
- **Debt Analysis Flow** (`debtAdvisor.ts`): Primary intelligence for debt analysis using Gemini Flash
- Avalanche and Snowball strategy calculations with AI-powered personalization
- Zod schemas for input/output validation

### Server Architecture
- **Express.js** server with TypeScript
- **Socket.io** for real-time features (user rooms, notifications)
- Modular route structure with handlers for business logic
- CORS enabled for frontend integration
- Health check endpoint at `/health`

### Data Models
Core TypeScript interfaces in `src/types/debt.ts`:
- `UserProfile`: User financial information
- `Debt`: Individual debt entries
- `SmartDebt`: Extended debt with psychology and automation features
- `PayoffStrategy`: Different debt payoff approaches
- `RewardSystem`: Gamification and points tracking
- `BehavioralNudge`: Personalized motivational messages

### AI Flow Pattern
Genkit flows use Zod schemas for validation:
```typescript
// Input validation
const DebtAnalysisInput = z.object({
  userProfile: z.object({...}),
  debts: z.array(...),
  availableAmount: z.number()
});

// AI-powered analysis with Gemini Flash
const llmResponse = await generate({
  model: gemini15Flash,
  prompt: `Financial advisor prompt...`
});
```

## Environment Variables

See `.env.example` for all required environment variables:
- `GOOGLE_GENAI_API_KEY`: Google AI API key for Genkit
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe integration
- `FLINK_CLIENT_ID` & `FLINK_SECRET`: Banking API
- `JWT_SECRET`: Authentication
- `PORT`: Server port (default: 3001)

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` → `src/*`
- `@/types/*` → `src/types/*`
- `@/utils/*` → `src/utils/*`
- `@/services/*` → `src/services/*`

## Testing Configuration

Jest setup with:
- `ts-jest` for TypeScript support
- Test files: `**/*.test.ts` or `**/*.spec.ts`
- Setup file: `src/test/setup.ts`
- Coverage reporting enabled
- 30-second test timeout for async operations