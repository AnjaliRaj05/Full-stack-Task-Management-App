# Taskora

> A focused task-management SaaS with workspaces, Kanban, subtasks, and a full activity log on every task. Built as a production-grade monorepo — Node/Express/Mongo on the backend, React 18 + Vite on the frontend.

> The product name **Taskora** is a working placeholder. The repo still uses the `Full-stack-Task-Management-App` Git name — the brand will be finalised before launch.

**Live (current demo):** https://lambent-granita-2ed3c2.netlify.app/

---

## What's inside

### For the user
- **Workspaces** — multi-tenant from the ground up. Each user gets a personal workspace on signup, and can create more for teams or projects. Tasks, comments, and activity are fully isolated per workspace.
- **Roles per workspace** — `owner`, `admin`, `member`, `viewer` with enforced permissions (viewers are read-only, members see only what they created or are assigned to).
- **Dashboard** — stat cards (Pending / In Progress / Completed), filterable, searchable, with ⌘K/Ctrl+K to focus search.
- **Kanban board** — drag-and-drop between `pending → in-progress → completed` columns with optimistic UI.
- **Task detail** — subtasks with progress bar, labels, priority, due date, assignee, threaded comments, and an immutable activity log.
- **Auth** — signup / login / refresh via httpOnly cookies with single-use refresh-token rotation.
- **Dark mode** as default, light mode toggle, persisted in localStorage.

### For the developer
- **Clean layering** — routes → controllers → services → models, no leaky logic.
- **Centralised error handler** with a custom `AppError` class; Mongoose and JWT errors are normalised.
- **Structured logging** — Winston JSON logs to files + pretty console in dev, piped from Morgan.
- **Rate limiting** — 10 requests / 15 min on auth routes, 100 / 15 min globally.
- **Swagger / OpenAPI** at `/api/docs` with Workspace + Task schemas documented.
- **CI** — GitHub Actions for prettier, lint (ESLint 9 flat config), CodeQL, npm audit, and Dependabot updates.
- **Docker** — hardened multi-stage backend image (non-root `node`, HEALTHCHECK, `NODE_ENV=production`), Nginx-served frontend, healthcheck on Mongo, no public Mongo port in prod compose.
- **`/healthz`** endpoint returns `503` if the Mongo connection is down.

---

## Tech stack

### Backend
| | |
|---|---|
| Runtime       | Node.js 20 (Alpine) |
| Framework     | Express 5 |
| Database      | MongoDB 7 / Mongoose |
| Auth          | JWT (15m access, 7d refresh, rotated per request) |
| Validation    | express-validator |
| Security      | helmet, CORS (origin allowlist), bcryptjs (cost 12), express-rate-limit |
| Logging       | Winston + Morgan |
| API docs      | swagger-jsdoc + swagger-ui-express |

### Frontend
| | |
|---|---|
| Framework     | React 18 + Vite 5 |
| Routing       | React Router 6 |
| HTTP          | Axios with token-refresh queue + auto `X-Workspace-Id` header |
| State         | React Context (`AuthContext`, `WorkspaceContext`, `ThemeContext`) |
| Icons         | lucide-react |
| Notifications | react-hot-toast |
| Drag & drop   | @dnd-kit (Kanban) |

### DevOps
- Docker / docker-compose (prod + dev variants)
- GitHub Actions (`ci.yml`, `codeql.yml`, `security.yml`)
- Dependabot (npm + docker + actions, weekly)
- Prettier + ESLint 9 flat config across both packages

---

## Getting started

### Prerequisites
- Node.js ≥ 20
- MongoDB ≥ 7 (or a Mongo Atlas connection string)
- npm ≥ 9

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env    # then edit values
npm run dev             # nodemon on :5000
```

Required env vars (see `backend/.env.example`):

```env
PORT=5000
DEV_MODE=development
MONGO_URL=mongodb://127.0.0.1:27017/taskora
JWT_SECRET=<32+ byte random string>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRY_DAYS=7
ALLOWED_ORIGINS=http://localhost:5173
```

> **Upgrading from a pre-workspaces install?** Run the one-shot migration before starting the server: `node scripts/migrate-add-workspaces.js`. It creates a personal workspace for every existing user and backfills `workspaceId` on their tasks, comments, and activity. Idempotent.

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev             # Vite on :5173
```

Create `frontend/.env` if the backend is not on the default port:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3 — Everything at once (Docker)

```bash
# production-ish
docker compose up --build

# dev with hot reload
docker compose -f docker-compose.dev.yml up
```

The production compose file does **not** expose Mongo on the host — only services inside the compose network can reach it. The dev compose keeps `:27017` open so you can attach Mongo Compass.

---

## API overview

Base path: `/api/v1`. Full interactive docs: open `http://localhost:5000/api/docs` once the backend is running.

### Auth (`/auth`)
| Method | Route           | Notes |
|--------|------------------|-------|
| POST   | `/signup`        | Creates user + personal workspace atomically |
| POST   | `/login`         | Sets `accessToken` + `refreshToken` httpOnly cookies |
| POST   | `/refresh`       | Rotates refresh token, issues new access token |
| GET    | `/me`            | Current user |
| POST   | `/logout`        | Revokes refresh token, clears cookies |

### Workspaces (`/workspaces`)
| Method | Route                 | Notes |
|--------|------------------------|-------|
| GET    | `/`                    | List workspaces the caller belongs to (with role) |
| POST   | `/`                    | Create new workspace (caller becomes owner) |
| GET    | `/:id`                 | Get one workspace (must be a member) |
| PATCH  | `/:id`                 | Update (owner/admin only) |
| GET    | `/:id/members`         | List members |

### Tasks (`/tasks` — workspace-scoped via `X-Workspace-Id` header)
| Method | Route                        | Notes |
|--------|-------------------------------|-------|
| POST   | `/`                           | Create task in current workspace |
| GET    | `/`                           | Paginated, filterable, searchable list |
| GET    | `/:id`                        | Single task with populated user refs |
| PUT    | `/:id`                        | Update (enforces role + ownership) |
| DELETE | `/:id`                        | Delete (owner/admin or task creator) |
| POST   | `/:id/comments`               | Add comment |
| GET    | `/:id/comments`               | List comments |
| GET    | `/:id/activity`               | Activity log for the task |

All task routes require auth **and** `workspaceScope` middleware — the caller must be a member of the target workspace or receive `403`.

---

## Data model

### User
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `fullname` | String | |
| `email` | String | unique |
| `password` | String | bcrypt, cost 12 |
| `role` | `admin \| user` | legacy — workspace role is the source of truth going forward |
| `defaultWorkspace` | ObjectId → Workspace | set on signup |

### Workspace
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `name` | String | |
| `slug` | String | unique, auto-generated |
| `owner` | ObjectId → User | |
| `plan` | `free \| pro \| team \| enterprise` | default `free` |
| `personal` | Boolean | `true` for the workspace auto-created at signup |

### WorkspaceMember
| Field | Type | Notes |
|---|---|---|
| `workspace` | ObjectId → Workspace | |
| `user` | ObjectId → User | |
| `role` | `owner \| admin \| member \| viewer` | |

Unique compound index on `(workspace, user)`.

### Task
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | |
| `workspace` | ObjectId → Workspace | required, indexed |
| `title` | String | required |
| `description` | String | |
| `status` | `pending \| in-progress \| completed` | default `pending` |
| `priority` | `low \| medium \| high \| urgent` | default `medium` |
| `dueDate` | Date | nullable |
| `labels` | `[String]` | |
| `assignedTo` | ObjectId → User | nullable |
| `subtasks` | `[{ title, completed }]` | |
| `createdBy` | ObjectId → User | |

Indexes: `(workspace, status, createdAt)`, `(workspace, assignedTo, status)`, `(workspace, createdBy)`, `(workspace, dueDate)`, `(workspace, labels)`, text index on `title`.

### Comment / Activity
Both scoped by `workspace`, linked to `taskId` and `userId`. Activity action enum: `created | updated | status_changed | commented | assigned | deleted`.

---

## Directory structure

```
taskora/
├── backend/
│   ├── config/            # db, env, logger, swagger
│   ├── controllers/       # thin HTTP handlers
│   ├── middleware/        # auth, authorize, workspaceScope, validate, errorHandler
│   ├── models/            # Mongoose schemas (User, Workspace, WorkspaceMember, Task, Comment, Activity, RefreshToken)
│   ├── routes/            # auth, workspaces, tasks, users
│   ├── services/          # business logic (authService, workspaceService, taskService, commentService)
│   ├── utils/             # AppError, slug generator
│   ├── scripts/           # one-shot migrations
│   ├── Dockerfile
│   ├── eslint.config.js   # flat config
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/    # Avatar, EmptyState, HeroMockup, Navbar, WorkspaceSwitcher, TaskCard, modals…
│   │   ├── context/       # AuthContext, WorkspaceContext, ThemeContext
│   │   ├── hooks/         # useReveal (scroll-triggered animations)
│   │   ├── pages/         # Home, Login, Register, Dashboard, KanbanBoard, TaskDetail, Workspaces
│   │   ├── services/      # api.js (axios with refresh queue + X-Workspace-Id header)
│   │   ├── styles/        # per-component CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── .github/
│   ├── workflows/         # ci, codeql, security
│   └── dependabot.yml
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

## Scripts reference

### Backend
```bash
npm run dev      # nodemon
npm start        # production
npm run lint     # ESLint 9 flat config
npm run format   # prettier --write
```

### Frontend
```bash
npm run dev      # Vite
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # ESLint
```

### One-off
```bash
node backend/scripts/migrate-add-workspaces.js   # backfill workspaces on legacy data
```

---

## Roadmap

Current priorities in order:

1. **Invitations & email** — invite teammates to a workspace via signed token, transactional email via Resend/SendGrid.
2. **Billing (Stripe)** — Free / Pro / Team plans enforced at the workspace level.
3. **Real-time (Socket.io)** — live task updates, comments, presence, namespaced per workspace.
4. **Background jobs (BullMQ + Redis)** — async email, due-date reminders, activity rollups.
5. **File attachments (S3 / R2)** — signed upload URLs with virus-scan hook.
6. **API keys + outbound webhooks** — unlock 3rd-party integrations.
7. **2FA (TOTP), then SSO (SAML/OIDC)** for enterprise tier.

Full plan: see the internal `memory/` or ask the maintainers.

---

## Contributing

1. Branch from `main`.
2. `npm install` in both `backend/` and `frontend/`.
3. Make changes — ensure `npm run lint` is clean in both packages.
4. Prettier is enforced via a `pre-commit` husky hook (`lint-staged`).
5. Open a PR. CI runs lint + CodeQL + npm audit on every push.

---

**Built with Node.js, Express, MongoDB, React, and Vite.**
