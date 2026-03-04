# Pagio

> AI-powered invoice management platform — Accounts Payable & Receivable

Pagio is a production-grade portfolio project built to demonstrate full-stack engineering skills across Firebase, React/Next.js, and foundation model APIs. It automates the invoice lifecycle: upload → AI extraction → anomaly detection → approval → payment, with natural language querying and real-time notifications.

---

## Features

| Story                  | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| Auth                   | Sign up / sign in with Firebase Authentication            |
| Vendors                | Create and manage vendor records                          |
| Upload                 | Upload PDF/image invoices linked to vendors               |
| AI Extraction          | Automatic structured data extraction via Claude API       |
| Correction             | Review and correct AI-extracted fields                    |
| Approval               | Approve or reject invoices with audit trail               |
| Payment                | Mark approved invoices as paid                            |
| Anomaly Detection      | Flag invoices that deviate >30% from vendor average       |
| Recommendations        | AI-generated approve/reject recommendation with rationale |
| Natural Language Query | Search invoices in plain English                          |
| Dashboard              | Summary of invoice activity by status                     |
| Notifications          | In-app alerts for overdue invoices (daily sweep)          |
| Team                   | Invite members, manage approver/viewer roles              |
| Export                 | Download invoice data as CSV                              |

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 15 (App Router), React 19, TypeScript |
| State      | Zustand                                       |
| Validation | Zod                                           |
| Backend    | Firebase Cloud Functions Gen 2 (TypeScript)   |
| Database   | Firestore (org-scoped collections)            |
| Auth       | Firebase Authentication (email/password)      |
| AI         | Anthropic Claude API — server-side only       |
| Testing    | Jest + React Testing Library                  |
| Styling    | Tailwind CSS                                  |
| CI         | GitHub Actions                                |

---

## Architecture

Hexagonal architecture with feature-based vertical slices. Domain logic is pure TypeScript — no Firebase or AI SDK imports. Adapters implement ports and can be swapped without touching business rules.

```
feature/
├── domain/       # Pure business logic and types
├── ports/        # Interfaces the domain depends on
├── adapters/     # Firebase and Claude implementations
└── __tests__/    # Unit tests against in-memory adapters
```

The AI pipeline on invoice creation runs as a sequential Cloud Function:

```
onInvoiceCreate → extraction → anomaly detection → recommendation
```

Each step writes to Firestore independently and fails gracefully without blocking the next.

---

## Project Structure

```
pagio/
├── apps/web/          # Next.js application
├── functions/         # Firebase Cloud Functions
├── shared/            # Shared TypeScript types (@pagio/shared)
├── firestore.rules    # Security rules (default deny)
├── firebase.json      # Hosting, functions, emulator config
└── .github/workflows/ # CI pipeline
```

---

## Getting Started

### Prerequisites

- Node.js v22
- pnpm v9
- Firebase CLI — `npm install -g firebase-tools`

### Install

```bash
git clone https://github.com/carls-rodrigues/Pagio.git
cd Pagio
pnpm install
```

### Environment variables

```bash
cp apps/web/.env.local.example apps/web/.env.local
cp functions/.env.example functions/.env
```

Fill in your Firebase project config and API keys.

### Run locally

```bash
# Start Firebase emulators
firebase emulators:start

# Start Next.js dev server (separate terminal)
pnpm dev
```

### Run tests

```bash
pnpm test
```

---

## Development Workflow

This project follows **Gitflow** and **Extreme Programming** practices.

### Branches

| Branch              | Purpose                   |
| ------------------- | ------------------------- |
| `main`              | Production-ready only     |
| `develop`           | Integration branch        |
| `feature/s-XX-slug` | One branch per user story |

### Story cycle

```
feature branch → TDD (red → green → refactor) → PR to develop → CI green → merge
```

### Commit convention

All commits follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(invoices): add AI extraction on upload
fix(auth): redirect unauthenticated users to sign-in
```

Pre-commit hooks enforce lint, formatting, and tests on every commit.

### CI pipeline

Every push and PR runs: **lint → typecheck → test → build**

---

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Start Next.js dev server             |
| `pnpm build`     | Build Next.js app                    |
| `pnpm test`      | Run all tests                        |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm lint`      | ESLint across all packages           |

---

## License

MIT
