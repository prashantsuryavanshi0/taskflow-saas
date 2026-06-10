# Setup Guide

## Prerequisites

- Node.js 22 LTS
- Python 3.12
- Supabase project with PostgreSQL connection string
- Google Cloud OAuth 2.0 Web Client
- Gmail account with a Gmail App Password

## Google OAuth

1. Open Google Cloud Console.
2. Create an OAuth 2.0 Client ID with application type `Web application`.
3. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - Your Vercel production URL
4. Copy the client ID into:
   - `backend/.env` as `GOOGLE_CLIENT_ID`
   - `frontend/.env` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## Supabase

1. Create a Supabase project.
2. Copy the PostgreSQL connection string.
3. Use the direct or transaction-pooler URL with `sslmode=require`.
4. Set it in `backend/.env`:

```bash
DATABASE_URL=postgresql://postgres:password@host:5432/postgres?sslmode=require
```

The backend also normalizes `postgres://` to `postgresql://` and adds `sslmode=require` for hosted PostgreSQL URLs if missing. Localhost URLs are left without forced SSL.

## Gmail SMTP

1. Enable 2-Step Verification on the Gmail account.
2. Create an App Password.
3. Set:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-gmail@gmail.com
```

## Backend Setup

```bash
cd backend
copy .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
flask --app app db upgrade
flask --app wsgi run --port 5000
```

Health check:

```bash
curl http://localhost:5000/health
```

## Frontend Setup

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Local Validation

Backend syntax:

```bash
python -m compileall backend
```

Frontend type/build checks:

```bash
cd frontend
npm run build
```

## Docker

```bash
docker compose up --build
```

Frontend runs on `http://localhost:3000`; backend runs on `http://localhost:5000`.
