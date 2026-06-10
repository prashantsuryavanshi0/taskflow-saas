# Production Readiness Testing Checklist

## Static Checks

- [ ] `cd frontend && npm install`
- [ ] `cd frontend && npm run build`
- [ ] `cd backend && pip install -r requirements.txt`
- [ ] `python -m compileall backend`
- [ ] `flask --app app routes` shows `/auth/google`, `/users`, `/tasks`, `/tasks/<task_id>`, `/tasks/<task_id>/status`, `/dashboard/stats`, and `/health`

## Authentication

- [ ] `/login` loads without console errors.
- [ ] Google login button opens Google Identity Services.
- [ ] `POST /auth/google` receives a Google credential.
- [ ] Backend rejects invalid Google credentials.
- [ ] Backend creates or updates the user.
- [ ] Backend returns `access_token` and user profile.
- [ ] Frontend stores token and user in `localStorage`.
- [ ] Protected routes redirect unauthenticated users to `/login`.
- [ ] Protected API calls include `Authorization: Bearer <token>`.
- [ ] Expired or invalid JWT returns a structured JSON error.

## Supabase Database

- [ ] `DATABASE_URL` points to Supabase PostgreSQL.
- [ ] URL uses `postgresql://` or is normalized by backend config.
- [ ] URL includes or is normalized to `sslmode=require`.
- [ ] `flask --app app db upgrade` completes successfully.
- [ ] Tables `users` and `tasks` exist.
- [ ] Enums `taskpriority` and `taskstatus` exist.
- [ ] `/health` returns `{ "status": "ok" }`.

## Flask API

- [ ] `GET /users` requires JWT.
- [ ] `GET /tasks` requires JWT.
- [ ] `POST /tasks` validates required title.
- [ ] `PUT /tasks/:id` updates only submitted fields.
- [ ] `DELETE /tasks/:id` removes a task.
- [ ] `PATCH /tasks/:id/status` accepts only `todo`, `in_progress`, and `completed`.
- [ ] Invalid filter values return `400`, not `500`.
- [ ] `GET /dashboard/stats` returns totals, charts, and recent activity.

## Gmail SMTP

- [ ] SMTP credentials are configured on Railway.
- [ ] Creating a task with `assigned_to` sends subject `New Task Assigned`.
- [ ] Changing assignee sends subject `New Task Assigned`.
- [ ] Moving a task to `completed` sends subject `Task Completed`.
- [ ] Re-saving an already completed task does not repeatedly send completion emails.
- [ ] Missing SMTP credentials do not crash local development.

## Frontend Tasks

- [ ] `/tasks` lists tasks.
- [ ] Create task modal opens and closes cleanly.
- [ ] Zod validation blocks empty titles.
- [ ] Editing a task persists changes.
- [ ] Deleting a task removes it from the list.
- [ ] Search matches task title and description.
- [ ] Status and sort filters call the expected API query.
- [ ] `/assigned` shows only tasks assigned to the logged-in user.

## Kanban

- [ ] `/tasks/board` loads todo, in-progress, and completed columns.
- [ ] Dragging a task into a new column updates the UI immediately.
- [ ] `PATCH /tasks/:id/status` is called with the new status.
- [ ] Database status changes after drop.
- [ ] Dragging inside the same column does not send an unnecessary mutation.
- [ ] Dropping outside a valid column does nothing.
- [ ] Completing a task from the board sends `Task Completed`.

## Dashboard and Profile

- [ ] `/dashboard` shows total, pending, in-progress, and completed counts.
- [ ] Status chart renders.
- [ ] Priority chart renders.
- [ ] Recent activity updates after task changes.
- [ ] `/profile` shows name, email, avatar, and statistics.

## Deployment Smoke Test

- [ ] Vercel frontend loads over HTTPS.
- [ ] Railway backend `/health` responds over HTTPS.
- [ ] Vercel can call Railway without CORS errors.
- [ ] Google OAuth origin matches the deployed Vercel domain.
- [ ] Supabase accepts Railway connections.
- [ ] Gmail SMTP sends from Railway.
