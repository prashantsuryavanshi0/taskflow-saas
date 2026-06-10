# Deployment Guide

## Supabase

1. Create a Supabase project.
2. Copy a PostgreSQL connection string.
3. Ensure the URL includes `sslmode=require`.
4. Save the URL for Railway as `DATABASE_URL`.

After the Railway backend is deployed, run migrations:

```bash
flask --app app db upgrade
```

Run this from Railway shell or a one-off command with the same environment variables.

## Railway Backend

Deploy the `backend` directory as its own Railway service.

Required variables:

```bash
DATABASE_URL=postgresql://...
SECRET_KEY=...
JWT_SECRET_KEY=...
JWT_EXPIRES_HOURS=12
GOOGLE_CLIENT_ID=...
FRONTEND_URL=https://your-vercel-app.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_FROM=...
```

Railway can use `backend/Dockerfile` and `backend/railway.json`. The Dockerfile binds Gunicorn to Railway's `$PORT`.

Health check:

```text
/health
```

Expected response:

```json
{ "status": "ok" }
```

## Vercel Frontend

Deploy the `frontend` directory as the Vercel project root.

Required variables:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

Build settings:

```text
Install Command: npm install
Build Command: npm run build
Output: Next.js default
```

## Google OAuth Production Settings

In Google Cloud Console, add:

Authorized JavaScript origins:

```text
https://your-vercel-app.vercel.app
```

The frontend obtains a Google ID token in the browser and sends it to Railway at `POST /auth/google`. The Flask backend verifies it against `GOOGLE_CLIENT_ID` and returns the app JWT.

## Gmail Production Settings

Use a Gmail App Password, not the normal Gmail password. The backend sends:

- `New Task Assigned` when a task receives a new assignee.
- `Task Completed` when a task moves to `completed`.

If SMTP credentials are not set, the backend logs a warning and skips email delivery.

## Migration Notes

The initial migration creates:

- `users`
- `tasks`
- PostgreSQL enums `taskpriority` and `taskstatus`

Command:

```bash
cd backend
flask --app app db upgrade
```

## Deployment Order

1. Create Supabase database.
2. Deploy Railway backend with env vars.
3. Run Alembic migrations against Supabase.
4. Deploy Vercel frontend with Railway API URL.
5. Add Vercel URL to Google OAuth origins.
6. Update Railway `FRONTEND_URL` to the final Vercel URL.
7. Test login, task assignment, completion email, and Kanban drag-and-drop.
