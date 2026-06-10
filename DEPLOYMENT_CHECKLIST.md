# Deployment Checklist

This checklist is the complete deployment path for a fresh developer deploying TaskFlow to Supabase, Railway, and Vercel.

## Required Environment Values

### Google OAuth

Create a Google OAuth 2.0 Web Client in Google Cloud Console.

Required values:

```bash
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

The same client ID is used by the frontend and backend.

Authorized JavaScript origins:

```text
http://localhost:3000
https://your-vercel-project.vercel.app
```

### Supabase

Create a Supabase PostgreSQL database.

Required value:

```bash
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
```

Use the Supabase direct connection string or pooler connection string. The backend automatically converts `postgres://` to `postgresql://` and adds `sslmode=require` for hosted Postgres if missing.

### Gmail SMTP

Use a Gmail App Password. Do not use your normal Gmail password.

Required values:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail-address@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-gmail-address@gmail.com
```

### JWT and Flask Security

Generate unique secrets:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Required values:

```bash
SECRET_KEY=replace-with-random-flask-secret
JWT_SECRET_KEY=replace-with-random-jwt-secret
JWT_EXPIRES_HOURS=12
```

### Frontend API URL

Required value:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app
```

For local development, use:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### CORS

Required backend value:

```bash
FRONTEND_URL=https://your-vercel-project.vercel.app
```

For local development, use:

```bash
FRONTEND_URL=http://localhost:3000
```

## Local Preflight

1. Copy env examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.local.example frontend\.env.local
```

2. Fill in all values in `backend/.env` and `frontend/.env.local`.

3. Install backend dependencies:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

4. Install frontend dependencies:

```bash
cd ..\frontend
npm install
```

5. Run frontend production build:

```bash
npm run build
```

6. Verify backend routes:

```bash
cd ..\backend
flask --app app routes
```

Expected routes:

```text
POST    /auth/google
GET     /users
GET     /tasks
POST    /tasks
PUT     /tasks/<task_id>
DELETE  /tasks/<task_id>
PATCH   /tasks/<task_id>/status
GET     /dashboard/stats
GET     /health
```

## Deploy Supabase

1. Sign in to Supabase.
2. Create a new project.
3. Save the database password securely.
4. Open Project Settings.
5. Open Database.
6. Copy the PostgreSQL connection string.
7. Ensure the URL includes `sslmode=require`.
8. Save this as `DATABASE_URL` for Railway.

No manual SQL is required. Alembic migrations create the schema.

## Deploy Railway Backend

1. Sign in to Railway.
2. Create a new project.
3. Choose deploy from GitHub or upload the repository.
4. Set the Railway service root directory to:

```text
backend
```

5. Railway should detect `backend/Dockerfile`.
6. Add these Railway environment variables:

```bash
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
SECRET_KEY=your-generated-flask-secret
JWT_SECRET_KEY=your-generated-jwt-secret
JWT_EXPIRES_HOURS=12
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail-address@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=your-gmail-address@gmail.com
```

7. Deploy the Railway service.
8. Open the Railway public URL.
9. Verify health:

```text
https://your-railway-service.up.railway.app/health
```

Expected response:

```json
{ "status": "ok" }
```

10. Run database migrations from Railway shell or one-off command:

```bash
flask --app app db upgrade
```

11. Confirm migration head:

```bash
flask --app app db current
```

Expected current revision:

```text
0001_initial_schema
```

## Deploy Vercel Frontend

1. Sign in to Vercel.
2. Import the repository.
3. Set the Vercel project root directory to:

```text
frontend
```

4. Set build settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

5. Add these Vercel environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-railway-service.up.railway.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

6. Deploy the Vercel project.
7. Copy the final Vercel URL.

## Final Production Wiring

1. Update Railway `FRONTEND_URL` to the final Vercel URL:

```bash
FRONTEND_URL=https://your-vercel-project.vercel.app
```

2. Redeploy Railway.
3. Open Google Cloud Console.
4. Add the final Vercel URL to Authorized JavaScript origins:

```text
https://your-vercel-project.vercel.app
```

5. Wait a few minutes for Google OAuth config propagation.

## Production Smoke Test

1. Open the Vercel URL.
2. Confirm `/login` loads.
3. Click `Continue with Google`.
4. Complete Google sign-in.
5. Confirm redirect to `/dashboard`.
6. Create a task at `/tasks`.
7. Assign the task to a user.
8. Confirm Gmail receives subject:

```text
New Task Assigned
```

9. Open `/tasks/board`.
10. Drag the task to `Completed`.
11. Confirm the database updates.
12. Confirm Gmail receives subject:

```text
Task Completed
```

13. Confirm `/dashboard` counts and charts update.
14. Confirm `/assigned` shows tasks assigned to the logged-in user.
15. Confirm `/profile` shows name, email, avatar, and statistics.

## Troubleshooting

### Google Login Does Not Open

- Confirm `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set on Vercel.
- Confirm the Vercel URL is listed in Google OAuth Authorized JavaScript origins.
- Confirm browser console does not show Google Identity Services origin errors.

### API Calls Fail With CORS

- Confirm Railway `FRONTEND_URL` exactly matches the Vercel URL.
- Include protocol and no trailing slash:

```text
https://your-vercel-project.vercel.app
```

### API Returns Unauthorized

- Confirm frontend local storage contains `taskflow_token`.
- Confirm backend `JWT_SECRET_KEY` did not change after users logged in.
- Log out and sign in again after rotating JWT secrets.

### Supabase Connection Fails

- Confirm `DATABASE_URL` uses the correct password.
- Confirm hosted URLs include `sslmode=require`.
- Confirm Railway environment variables were redeployed.

### Gmail Does Not Send

- Confirm Gmail 2-Step Verification is enabled.
- Confirm `SMTP_PASSWORD` is a Gmail App Password.
- Confirm `SMTP_USERNAME` and `SMTP_FROM` are valid Gmail addresses.

## Files To Use

Backend env example:

```text
backend/.env.example
```

Frontend env example:

```text
frontend/.env.local.example
```

Deployment configuration:

```text
backend/Dockerfile
backend/railway.json
frontend/vercel.json
```
