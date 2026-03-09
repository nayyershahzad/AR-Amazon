# AR/3D Amazon Seller - Backend

Backend API for the AR/3D Amazon Seller SaaS MVP.

## Features

- User authentication (JWT)
- Image upload and processing
- Meshy.ai API integration for 3D model generation
- Model management (CRUD operations)
- Status polling for 3D generation tasks

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Meshy.ai API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ar3d_mvp"
JWT_SECRET="your-secret-key"
MESHY_API_KEY="your-meshy-api-key"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Production

Build and start:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Models
- `GET /api/models` - Get all user's models (protected)
- `GET /api/models/:id` - Get single model (protected)
- `POST /api/models/create` - Upload image & create 3D model (protected)
- `GET /api/models/:id/status` - Check generation status (protected)
- `DELETE /api/models/:id` - Delete model (protected)

### Meshy
- `GET /api/meshy/status/:taskId` - Check Meshy task status (protected)

## Database Schema

See `src/prisma/schema.prisma` for the complete schema.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── middleware/     # Auth and upload middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic (Meshy service)
│   ├── prisma/         # Database schema
│   └── server.js       # Express app
├── uploads/            # Temporary file storage
└── package.json
```

## Deployment

This app is designed to be deployed on Render.com. See the main README for deployment instructions.
