# Daybook API

Express + MongoDB API for the Daybook diary app. It uses JWT authentication and stores entries, profile data, and bounded image attachments in MongoDB.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI` to a local MongoDB Community database. Set `JWT_SECRET` to a random secret of at least 32 characters. `CLIENT_ORIGIN` defaults to `http://localhost:5173`.

## Deploy the API

Use a Node.js host. Install with `npm install`, then run `npm start`. Set these environment variables in the host dashboard:

- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — a random secret, at least 32 characters
- `CLIENT_ORIGIN` — the exact deployed frontend origin (no path)
- `NODE_ENV=production`

The frontend's only deployment-specific setting is `VITE_API_URL`, set to this API's origin. Do not add `/api` or a trailing slash.

## Routes

- `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/me`
- `GET /api/entries`, `POST /api/entries`, `GET /api/entries/:id`, `DELETE /api/entries/:id`
- `GET /api/health`
