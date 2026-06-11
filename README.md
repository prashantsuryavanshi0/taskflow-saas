# TaskFlow SaaS

A production-ready full-stack task management SaaS application built with Next.js, Flask, PostgreSQL, Google OAuth 2.0, JWT Authentication, Resend Email Notifications, Railway, and Vercel.

---

# Live Demo

Frontend:
https://taskflow-saas-olive.vercel.app/login

Backend:
https://taskflow-saas-production-1051.up.railway.app/

---

# Project Overview

TaskFlow is a collaborative task management platform that allows users to:

* Sign in using Google Authentication
* Create tasks
* Assign tasks to other users
* Update task status
* Track project progress
* View dashboard analytics
* Receive automated email notifications

The application follows a modern SaaS architecture with a separate frontend, backend, database, authentication system, and notification service.

---

# Architecture

```mermaid
flowchart LR

U["User Browser"]
--> F["Vercel - Next.js Frontend"]

F --> G["Google OAuth"]

F --> B["Railway - Flask API"]

B --> J["JWT Authentication"]

B --> D["Supabase PostgreSQL"]

B --> E["Resend Email Service"]
```

---

# Tech Stack

## Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* TanStack Query
* DnD Kit
* Framer Motion
* Recharts

## Backend

* Flask
* SQLAlchemy
* Marshmallow
* Flask-JWT-Extended
* Alembic

## Database

* Supabase PostgreSQL

## Authentication

* Google OAuth 2.0

## Email Notifications

* Resend API

## Deployment

* Vercel (Frontend)
* Railway (Backend)

---

# Features

## Authentication

* Google OAuth Login
* Server-side token verification
* JWT generation
* Protected routes
* Session persistence

## Task Management

* Create Task
* Update Task
* Delete Task
* Assign Task
* Search Tasks
* Filter Tasks
* Sort Tasks

## Dashboard Analytics

* Total Tasks
* Pending Tasks
* In Progress Tasks
* Completed Tasks

Charts:

* Status Distribution
* Priority Distribution

## Team Collaboration

* Assign tasks to users
* Track ownership
* Track assignee information
* Status management

## Kanban Board

* Drag-and-drop workflow
* Real-time status updates
* Visual task management

## Email Notifications

* Task Assignment Notification
* Task Completion Notification

---

# File Structure

```text
backend/
├── app.py
├── config.py
├── extensions.py
├── wsgi.py
├── middleware/
├── migrations/
├── models/
├── routes/
├── services/
│   ├── email_service.py
│   └── google_auth.py
└── utils/

frontend/
├── app/
├── components/
├── features/
├── hooks/
├── services/
├── store/
└── types/
```

---

# Database Design

## Users Table

Stores:

* User ID
* Name
* Email
* Avatar

## Tasks Table

Stores:

* Task ID
* Title
* Description
* Status
* Priority
* Creator ID
* Assignee ID
* Created At
* Updated At

Relationships are managed using SQLAlchemy ORM.

---

# API Endpoints

Authentication:

```http
POST /auth/google
```

Users:

```http
GET /users
```

Tasks:

```http
GET /tasks
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
PATCH /tasks/:id/status
```

Dashboard:

```http
GET /dashboard/stats
```

---

# Environment Variables

## Backend

```env
DATABASE_URL=

JWT_SECRET_KEY=

GOOGLE_CLIENT_ID=

FRONTEND_URL=

RESEND_API_KEY=
```

## Frontend

```env
NEXT_PUBLIC_API_URL=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

# Local Development

## Backend

```bash
cd backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

flask --app app db upgrade

flask --app wsgi run --port 5000
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Deployment

## Database

Supabase PostgreSQL

## Backend

Railway

Start Command:

```bash
gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 3
```

## Frontend

Vercel

---

# Email Notification System

## Initial SMTP Implementation

The notification system was initially implemented using Gmail SMTP and App Password authentication.

Implemented functionality:

* Task Assignment Notifications
* Task Completion Notifications
* Dynamic Recipient Emails
* Production Environment Configuration

The SMTP implementation worked correctly in local development.

During deployment testing, outbound SMTP connectivity restrictions in the hosting environment prevented reliable email delivery.

Because of this deployment limitation, SMTP was replaced with a more cloud-friendly solution.

---

## Resend API Migration

The notification system was migrated to Resend API.

Benefits:

* API-based email delivery
* Better cloud compatibility
* Reliable deployment support
* Easier production scaling

---

## Current Demonstration Mode

The application currently uses Resend's testing mode.

Features demonstrated:

* Email notification workflow implemented
* Assignment notifications implemented
* Completion notifications implemented
* End-to-end notification architecture completed

In testing mode, emails can be delivered to the verified owner email address.

---

## Production Email Delivery

The application architecture is fully production-ready.

To enable notifications for any email address:

1. Verify a custom domain in Resend
2. Configure DNS records
3. Set a verified sender address

Example:

```env
EMAIL_FROM=noreply@yourdomain.com
```

After domain verification:

* Any user can log in using Google Authentication
* Any task can be assigned to any valid email address
* Assignment notifications will be delivered
* Completion notifications will be delivered
* No code changes are required

---

# Challenges Faced

## Challenge 1

Google OAuth Client ID synchronization between frontend and backend.

### Solution

Configured identical Google Client IDs across:

* Railway
* Vercel
* Google Cloud Console

---

## Challenge 2

SMTP email delivery restrictions during deployment.

### Solution

Migrated from Gmail SMTP to Resend API.

This provided a more scalable and cloud-native email delivery architecture.

---

# Security

* JWT Authentication
* Protected API Routes
* Google Token Verification
* Environment Variable Management
* Input Validation using Marshmallow

---

# Future Improvements

* Multi-project workspaces
* Team roles and permissions
* Activity logs
* File attachments
* Real-time notifications
* Verified production email domain
* Mobile application

---

# Conclusion

TaskFlow demonstrates:

* Full Stack Development
* Authentication Systems
* REST API Design
* Database Modeling
* Cloud Deployment
* Team Collaboration Features
* Dashboard Analytics
* Email Notification Architecture

This project was built to showcase production-ready SaaS application development using modern web technologies.

