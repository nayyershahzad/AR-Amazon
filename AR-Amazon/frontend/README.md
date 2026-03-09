# AR/3D Amazon Seller - Frontend

React frontend for the AR/3D Amazon Seller SaaS MVP.

## Features

- User authentication (login/register)
- Image upload with drag-and-drop
- Real-time 3D model viewer (Three.js)
- Model management dashboard
- Responsive design (Tailwind CSS)

## Prerequisites

- Node.js 18+
- Backend API running

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Production

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth/           # Login/Register
│   │   ├── Dashboard/      # Dashboard & Model Cards
│   │   ├── Layout/         # Header
│   │   ├── ModelViewer/    # 3D Viewer (Three.js)
│   │   └── Upload/         # Image Upload & Processing
│   ├── contexts/           # Auth Context
│   ├── services/           # API client
│   ├── App.jsx             # Main app & routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind styles
└── package.json
```

## Key Technologies

- **React 18** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Three.js** - 3D rendering
- **@react-three/fiber** - React wrapper for Three.js
- **@react-three/drei** - Three.js helpers
- **Axios** - HTTP client

## Deployment

This app is designed to be deployed on Render.com as a static site. See the main README for deployment instructions.
