# DebtWise - AI-Powered Debt Payoff Strategy Advisor

DebtWise is an intelligent debt management application that combines Google's Generative AI with personalized financial strategies to help users become debt-free efficiently.

## 🚀 Local Testing & Development

### Prerequisites

- Node.js 18+ and npm 8+
- Google AI API key (from Google AI Studio)

### Quick Start

1. **Install dependencies:**
```bash
npm install
cd client && npm install && cd ..
```

2. **Set up environment:**
```bash
cp .env.example .env.development
# Edit .env.development and add your Google AI API key
```

3. **Start development servers:**
```bash
# Start both backend and frontend
npm run dev

# Or start separately:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

### 🧪 Testing the Application

#### 1. **Backend API Testing**

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test debt analysis with sample data:
```bash
curl -X GET http://localhost:3001/api/debt/test-data
```

Test debt analysis endpoint:
```bash
curl -X POST http://localhost:3001/api/debt/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userProfile": {
      "monthlyIncome": 5000,
      "monthlyExpenses": 3500
    },
    "debts": [
      {
        "name": "Credit Card 1",
        "balance": 5000,
        "interestRate": 0.18,
        "minimumPayment": 150
      }
    ],
    "userGoals": "I want to be debt-free quickly"
  }'
```

#### 2. **Frontend Testing**

1. Open http://localhost:3000 in your browser
2. Click "Load Test Data" to populate sample information
3. Click "Analyze Debts with AI" to test the complete flow
4. Verify the AI responds with personalized debt strategies

#### 3. **Unit Testing**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 🔧 Development Features

- **Hot reload** for both frontend and backend
- **TypeScript** with strict type checking
- **Mock services** for external APIs during development
- **Comprehensive error handling** with detailed development logs
- **Socket.io integration** for real-time features

### 📊 Available Endpoints

- `GET /health` - Health check
- `GET /api/test` - Basic API test
- `GET /api/debt/test-data` - Sample debt data
- `POST /api/debt/analyze` - AI debt analysis
- `POST /api/debt/projection` - Payoff projections

### 🐛 Common Issues & Solutions

**Backend won't start:**
- Check if port 3001 is available
- Verify Google AI API key is set in .env.development

**Frontend can't connect to backend:**
- Ensure CORS is enabled (default: http://localhost:3000)
- Check that backend is running on port 3001

**AI responses not working:**
- Verify Google AI API key is valid
- Check network connectivity
- Review server logs for detailed error messages

### 🔨 Build Commands

```bash
npm run build          # Build both frontend and backend
npm run build:backend  # Build backend only
npm run build:frontend # Build frontend only
npm start             # Start production server
```

### 📁 Project Structure

```
DebtWise/
├── src/                 # Backend source code
│   ├── agent/          # Google ADK AI flows
│   ├── handlers/       # Express route handlers
│   ├── routes/         # API routes
│   ├── types/          # TypeScript interfaces
│   └── test/           # Test files and mock data
├── client/             # React frontend
│   └── src/components/ # React components
├── package.json        # Backend dependencies & scripts
└── README.md           # This file
```

Ready to start building your AI-powered debt freedom journey! 🎯