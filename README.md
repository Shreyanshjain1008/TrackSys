# TrackSys

TrackSys is a full-stack JIRA like issue tracking application built with FastAPI and React, featuring JWT auth, project/member management, Kanban boards, issue assignment, comments, attachments, real-time updates via WebSocket, and a modern light/dark UI.

It includes:
- JWT authentication (register/login)
- Project and member management (add/remove members with roles)
- Kanban issue board with drag-and-drop status updates
- Issue assignment to any registered user
- Comments and file attachments
- Delete actions for projects, members, issues, comments, and attachments
- Light/Dark theme toggle in frontend

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Supabase Storage
- Frontend: React (CRA), React Router, Tailwind CSS, Axios

## Repository Structure

```text
TrackSys/
  backend/
    app/
      api/
      core/
      db/
      utils/
    alembic/
    requirements.txt
  frontend/
    src/
    package.json
  tests/
  README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+ (recommended)
- PostgreSQL
- Supabase project + storage bucket

## Backend Setup

From `backend/`:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/tracksys
SECRET_KEY=replace-with-strong-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=["https://track-sys.vercel.app"]

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_BUCKET=tracksys
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
# Optional fallback if service role key not provided:
# SUPABASE_KEY=<key>
```

Run migrations:

```powershell
alembic upgrade head
```

Run backend:

```powershell
uvicorn app.main:app --reload
```

Backend URLs:
- API: `https://tracksys.onrender.com`
- Swagger: `https://tracksys.onrender.com/docs`

## Frontend Setup

From `frontend/`:

```powershell
npm install
npm start
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=https://track-sys.vercel.app
REACT_APP_SUPABASE_URL=https://<your-project-ref>.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon-key>
REACT_APP_SUPABASE_BUCKET=tracksys
```

Frontend URL:
- App: `https://track-sys.vercel.app`

## Current API Summary

Auth:
- `POST /auth/register`
- `POST /auth/login`

Users:
- `GET /users/`

Projects:
- `POST /projects/`
- `GET /projects/`
- `DELETE /projects/{project_id}`
- `GET /projects/{project_id}/members`
- `POST /projects/{project_id}/members`
- `DELETE /projects/{project_id}/members/{user_id}`

Issues:
- `POST /issues/projects/{project_id}`
- `GET /issues/projects/{project_id}`
- `PATCH /issues/{issue_id}/status`
- `DELETE /issues/{issue_id}`

Comments:
- `POST /comments/issues/{issue_id}`
- `GET /comments/issues/{issue_id}`
- `DELETE /comments/{comment_id}`

Attachments:
- `POST /attachments/issues/{issue_id}`
- `GET /attachments/issues/{issue_id}`
- `DELETE /attachments/{attachment_id}`

WebSocket:
- `GET ws://localhost:8000/ws/boards?token=<jwt>&project_id=<id>`

## Notes on Attachments

- Uploads are handled by backend and stored in Supabase Storage.
- Public URL is saved in DB and returned in attachment API.
- If you see `Bucket not found`, verify:
  - `SUPABASE_URL`
  - `SUPABASE_BUCKET`
  - bucket actually exists in that Supabase project

## Common Troubleshooting

### Pydantic `BaseSettings` import error

If you see:
`BaseSettings has been moved to pydantic-settings`

You are likely running backend with a different/global Python env.

Use project venv:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 307 redirects on comments/attachments list endpoints

Use URLs without trailing slash:
- `/comments/issues/{id}`
- `/attachments/issues/{id}`

### Dark mode text not visible

Theme styles are controlled in:
- `frontend/src/index.css`

## Tests

From `backend/` (with venv active):

```powershell
pytest
```

## License

No license file is currently defined in this repository.
