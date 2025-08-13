# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DebtWise is an AI-powered debt payoff strategy advisor that combines conversational AI debt analysis, psychology-based rewards, smart automation, and banking integration. The project is designed as a comprehensive fintech application that helps users manage and pay off debt through personalized strategies and gamification.

## Technology Stack

- **Backend**: Node.js + TypeScript + Express
- **AI**: Google Agent Development Kit (ADK/Genkit) with Gemini Pro
- **Database**: PostgreSQL or MongoDB
- **Banking Integration**: Flink API for secure bank account connectivity
- **Frontend**: React with TypeScript
- **Real-time**: Socket.io for live updates
- **Payments**: Stripe for reward payouts
- **Scheduling**: node-cron for automated payments

## Development Commands

Based on the project specification, the following commands should be available:

```bash
# Project initialization
genkit init smart-debt-advisor
npm install

# Development server
npm run dev

# Build
npm run build

# Testing
npm test

# Linting and type checking
npm run lint
npm run typecheck
```

## Project Structure

```
src/
├── agent/              # Google ADK flows and AI prompts
│   ├── masterDebtAgent.ts
│   ├── rewardEngine.ts
│   ├── automationEngine.ts
│   ├── educationEngine.ts
│   └── socialEngine.ts
├── types/              # TypeScript interfaces and data models
│   ├── debt.ts
│   ├── user.ts
│   └── rewards.ts
├── services/           # External API integrations
│   ├── flinkIntegration.ts
│   ├── stripeService.ts
│   └── paymentScheduler.ts
├── utils/              # Helper functions and calculations
│   ├── debtCalculations.ts
│   └── behavioralAnalytics.ts
├── database/           # Database models and migrations
├── handlers/           # Express route handlers
│   └── enhancedChatHandler.ts
└── client/             # React frontend components
```

## Core Architecture

### AI Agent System
The application uses Google ADK (Genkit) flows for conversational AI:
- **Master Debt Agent**: Primary intelligence for debt analysis and strategy
- **Reward Engine**: Gamification and points calculation
- **Automation Engine**: Smart payment scheduling and optimization
- **Education Engine**: Personalized financial learning modules
- **Social Engine**: Community features and peer engagement

### Banking Integration
Secure connectivity through Flink API:
- Account linking and verification
- Transaction analysis for cash flow patterns
- Automated payment execution
- Real-time balance monitoring

### Psychology-Based Features
- Behavioral pattern analysis
- Personalized motivation strategies
- Customized nudges based on user psychology profile
- Reward optimization for different personality types

### Data Models
Key interfaces include:
- `SmartDebt`: Enhanced debt with automation and psychology features
- `DebtPsychology`: User behavioral patterns and preferences
- `RewardSystem`: Points, achievements, and gamification tracking
- `BehavioralNudge`: Personalized motivational messages

## Development Approach

This project is designed for solo development with Claude Code:

1. **Incremental Development**: Build features one at a time
2. **Test-Driven**: Implement comprehensive testing for each component
3. **Modular Architecture**: Clear separation between AI, database, and UI layers
4. **Progressive Enhancement**: Start with core features, add complexity gradually

## Environment Variables

Required environment variables:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
PROJECT_ID=your_gcp_project_id
FLINK_CLIENT_ID=your_flink_client_id
FLINK_SECRET=your_flink_secret
STRIPE_SECRET_KEY=your_stripe_key
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## Key Implementation Notes

- Use Google ADK's `defineFlow` and `definePrompt` for AI interactions
- Implement real-time features using Socket.io for user engagement
- Follow security best practices for financial data handling
- Ensure all payment automation includes user confirmation workflows
- Implement comprehensive error handling for banking API integrations
- Use TypeScript throughout for type safety
- Prioritize mobile-responsive design for accessibility

## Testing Strategy

- Unit tests for calculation utilities and core business logic
- Integration tests for banking API connections
- End-to-end tests for critical user workflows
- AI flow testing for conversational quality
- Security testing for financial data protection