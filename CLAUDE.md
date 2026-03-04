# Pagio — CLAUDE.md

## Project Overview

Pagio is a portfolio project demonstrating production-grade engineering skills for a Full-Stack Engineer role at an enterprise automation company. It is an AI-powered invoice management platform (Accounts Payable / Accounts Receivable) built to showcase:

- Firebase-based backend (Firestore, Cloud Functions, triggers)
- React / Next.js frontend
- Foundation model API integration (Anthropic Claude / OpenAI)
- Extreme Programming practices: TDD, user stories, pair-friendly code, continuous refactoring

---

## Tech Stack

| Layer      | Technology                                                     |
| ---------- | -------------------------------------------------------------- |
| Frontend   | Next.js (App Router), React, TypeScript                        |
| State      | Zustand                                                        |
| Validation | Zod                                                            |
| Backend    | Firebase Cloud Functions (TypeScript)                          |
| Database   | Firestore (org-scoped: `/organizations/{orgId}/...`)           |
| Auth       | Firebase Authentication                                        |
| AI         | Anthropic Claude API — Cloud Functions only, never frontend    |
| Testing    | Jest + React Testing Library (frontend), Jest (functions)      |
| Styling    | Tailwind CSS                                                   |
| CI         | GitHub Actions (from day one: lint → typecheck → test → build) |

---

## Architecture

**Hexagonal Architecture + Feature-based folders**

Code is organized by feature (vertical slices). Within each feature, domain logic is separated from infrastructure via interfaces (ports & adapters). No full DDD — no aggregates, value objects, or domain events.

### Structure per feature

```
invoices/
├── domain/          # Pure business logic, no Firebase or Claude imports
│   ├── invoice.ts   # Types and rules
│   └── invoice.service.ts
├── ports/           # Interfaces (what the domain needs)
│   ├── invoice.repository.ts
│   └── ai.extractor.ts
├── adapters/        # Implementations (Firebase, Claude)
│   ├── firestore.invoice.repository.ts
│   └── claude.extractor.ts
└── __tests__/
```

### Rules

- Domain logic never imports Firebase, Claude, or Next.js directly
- Adapters implement ports — swap infrastructure without touching domain
- Unit tests test domain logic with mock ports — no emulator needed

### Complete Project Structure

```
pagio/
├── apps/
│   └── web/                              # Next.js application
│       ├── src/
│       │   ├── app/                      # App Router pages
│       │   │   ├── (auth)/               # Public routes
│       │   │   │   ├── sign-in/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── sign-up/
│       │   │   │       └── page.tsx
│       │   │   ├── (dashboard)/          # Protected routes
│       │   │   │   ├── layout.tsx        # Auth guard
│       │   │   │   ├── page.tsx          # Dashboard (S-15)
│       │   │   │   ├── invoices/
│       │   │   │   │   ├── page.tsx      # Invoice list (S-07, S-08)
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx  # Invoice detail (S-09)
│       │   │   │   ├── vendors/
│       │   │   │   │   └── page.tsx      # Vendor management (S-03)
│       │   │   │   └── settings/
│       │   │   │       └── page.tsx      # Org settings (S-17, S-18)
│       │   │   └── layout.tsx
│       │   ├── features/                 # Feature modules
│       │   │   ├── auth/
│       │   │   │   ├── components/       # SignInForm, SignUpForm
│       │   │   │   ├── hooks/            # useAuth
│       │   │   │   ├── schemas/          # Zod schemas
│       │   │   │   └── store/            # Zustand auth store
│       │   │   ├── invoices/
│       │   │   │   ├── components/       # InvoiceList, InvoiceCard, InvoiceDetail
│       │   │   │   ├── hooks/            # useInvoices, useInvoice
│       │   │   │   └── schemas/          # Zod schemas
│       │   │   ├── vendors/
│       │   │   │   ├── components/       # VendorList, VendorForm
│       │   │   │   ├── hooks/            # useVendors
│       │   │   │   └── schemas/          # Zod schemas
│       │   │   ├── dashboard/
│       │   │   │   └── components/       # SummaryCards, OverdueList
│       │   │   └── organizations/
│       │   │       ├── components/       # InviteForm, MemberList, RoleSelector
│       │   │       └── hooks/            # useOrganization
│       │   ├── lib/
│       │   │   ├── firebase/
│       │   │   │   ├── client.ts         # Firebase app init
│       │   │   │   └── storage.ts        # Firebase Storage helpers
│       │   │   └── functions/            # Callable Cloud Functions client
│       │   ├── store/                    # Global Zustand stores
│       │   │   ├── auth.store.ts
│       │   │   └── notification.store.ts
│       │   └── types/                    # Frontend-only types
│       ├── middleware.ts                 # Route protection
│       ├── jest.config.ts
│       └── package.json
│
├── functions/                            # Firebase Cloud Functions
│   ├── src/
│   │   ├── invoices/
│   │   │   ├── domain/
│   │   │   │   ├── invoice.ts
│   │   │   │   └── invoice.service.ts
│   │   │   ├── ports/
│   │   │   │   ├── invoice.repository.ts
│   │   │   │   └── ai.extractor.ts
│   │   │   ├── adapters/
│   │   │   │   ├── firestore.invoice.repository.ts
│   │   │   │   └── claude.extractor.ts
│   │   │   └── triggers/
│   │   │       ├── onInvoiceCreate.ts    # AI extraction + anomaly detection
│   │   │       └── onInvoiceStatusChange.ts
│   │   ├── vendors/
│   │   │   ├── domain/
│   │   │   ├── ports/
│   │   │   └── adapters/
│   │   ├── organizations/
│   │   │   ├── domain/
│   │   │   ├── ports/
│   │   │   └── adapters/
│   │   ├── ai/
│   │   │   └── prompts/                  # Versioned prompt constants
│   │   ├── notifications/
│   │   │   └── triggers/
│   │   │       └── onSchedule.ts         # Daily overdue sweep (S-16)
│   │   └── shared/
│   │       ├── firebase-admin.ts         # Admin SDK init
│   │       └── errors.ts                 # Shared error types
│   ├── __tests__/
│   ├── jest.config.ts
│   └── package.json
│
├── shared/                               # Shared types (web + functions)
│   └── types/
│       ├── invoice.ts
│       ├── vendor.ts
│       ├── organization.ts
│       └── index.ts
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # lint → typecheck → test → build
│
├── .husky/
│   └── pre-commit                        # lint-staged + commitlint
│
├── docs/
│   └── stories/                          # Reference copies of user stories
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── .firebaserc
├── commitlint.config.js
├── .eslintrc.js
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
└── CLAUDE.md
```

---

## Services, Jobs, and Models

### Models

#### `User`

```ts
id: string;
email: string;
displayName: string;
organizationId: string;
```

#### `Organization`

```ts
id: string;
name: string;
createdAt: Timestamp;
```

#### `OrganizationMember`

```ts
userId: string;
role: "approver" | "viewer";
joinedAt: Timestamp;
```

#### `Invitation`

```ts
id: string;
organizationId: string;
email: string;
expiresAt: Timestamp; // 48 hours from creation
accepted: boolean;
```

#### `Vendor`

```ts
id: string;
name: string;
email: string;
taxId: string; // unique per organization
organizationId: string;
```

#### `Invoice`

```ts
id: string
organizationId: string
vendorId: string
fileUrl: string
status: 'pending' | 'extracted' | 'extraction_failed' | 'approved' | 'rejected' | 'paid'
amount: number
dueDate: Timestamp
lineItems: LineItem[]
aiSummary: string
aiRecommendation: 'approve' | 'reject' | null
isAnomalous: boolean
anomalyReason: string | null
extractedFields: Record<string, boolean>  // tracks which fields were AI-extracted
rejectionReason: string | null
paidAt: Timestamp | null
approvedAt: Timestamp | null
approvedBy: string | null
createdAt: Timestamp
updatedAt: Timestamp
```

#### `LineItem`

```ts
description: string;
quantity: number;
unitPrice: number;
total: number;
```

#### `Notification`

```ts
id: string;
userId: string;
organizationId: string;
message: string;
invoiceId: string;
read: boolean;
createdAt: Timestamp;
```

---

### Services

#### Frontend (`apps/web`)

| Service               | Responsibilities                                                          |
| --------------------- | ------------------------------------------------------------------------- |
| `AuthService`         | Sign up, sign in, sign out                                                |
| `InvoiceService`      | Upload, list, get, approve, reject, mark paid, correct data, export CSV   |
| `VendorService`       | Create, list, get                                                         |
| `OrganizationService` | Invite member, list members, update role                                  |
| `QueryService`        | Send natural language query to callable function, return filtered results |
| `NotificationService` | List notifications, mark as read                                          |

#### Functions (`functions/`)

| Service                       | Responsibilities                                                     |
| ----------------------------- | -------------------------------------------------------------------- |
| `AIExtractionService`         | Extract structured data from invoice file using Claude               |
| `AnomalyDetectionService`     | Compare invoice amount to vendor average, flag if deviation > 30%    |
| `RecommendationService`       | Generate approve/reject recommendation using Claude + vendor history |
| `NaturalLanguageQueryService` | Translate natural language query to Firestore filters using Claude   |
| `NotificationService`         | Create in-app notifications                                          |
| `InvitationService`           | Create invite, validate invite link, add member to organization      |

---

### Jobs (Cloud Functions Triggers)

| Job                     | Trigger                   | Responsibilities                                   |
| ----------------------- | ------------------------- | -------------------------------------------------- |
| `onInvoiceCreate`       | Firestore document create | AI extraction → anomaly detection → recommendation |
| `onInvoiceStatusChange` | Firestore document update | Send notification on status change                 |
| `onSchedule`            | Daily (cron)              | Overdue invoice sweep → create notifications       |

---

### Invoice Status Lifecycle

```
pending → extracted → approved → paid
       ↘ extraction_failed        ↘ rejected
```

---

## Design Patterns

Patterns marked **[Day One]** must be in place before writing any feature code. Others are introduced when the relevant story begins.

---

### 1. Port & Adapter (Hexagonal) `[Day One]`

Domain logic defines interfaces (ports). Infrastructure implements them (adapters). The domain never imports Firebase, Claude, or Next.js directly.

```ts
// Port
interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>
  findById(id: string): Promise<Invoice | null>
}

// Adapter
class FirestoreInvoiceRepository implements InvoiceRepository { ... }

// Test adapter
class InMemoryInvoiceRepository implements InvoiceRepository { ... }
```

---

### 2. Repository `[Day One]`

All Firestore reads and writes go through a repository. No component or service queries Firestore directly.

```ts
// Good
const invoice = await invoiceRepository.findById(id);

// Bad
const invoice = await db.collection("invoices").doc(id).get();
```

---

### 3. Singleton `[Day One]`

Firebase app and Zustand stores are initialized once and reused. Never instantiate Firebase more than once.

```ts
// lib/firebase/client.ts
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
```

---

### 4. Schema Validation `[Day One]`

Zod schemas validate data at every system boundary: form inputs, AI output, Firestore reads, and callable function responses.

```ts
const InvoiceSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  lineItems: z.array(LineItemSchema),
});

// Always validate before writing to Firestore
const result = InvoiceSchema.safeParse(aiOutput);
if (!result.success) throw new ExtractionError(result.error);
```

---

### 5. Guard `[Day One]`

Route protection is enforced in Next.js middleware. Role-based action guards are enforced in both UI and Firestore security rules.

```ts
// middleware.ts
if (!sessionCookie && isProtectedRoute(request)) {
  return NextResponse.redirect("/sign-in");
}
```

---

### 6. Optimistic UI `[Day One]`

UI updates immediately on user action. Firestore write happens in the background. On failure, state rolls back.

```ts
// Update Zustand store immediately
store.setInvoiceStatus(id, "approved");

try {
  await invoiceService.approve(id);
} catch {
  store.setInvoiceStatus(id, previousStatus); // rollback
}
```

---

### 7. Strategy `[S-05]`

AI provider is swappable. Claude is the default; OpenAI is the fallback. Both implement the same port.

```ts
interface AIExtractor {
  extract(fileUrl: string): Promise<ExtractedInvoice>
}

class ClaudeExtractor implements AIExtractor { ... }
class OpenAIExtractor implements AIExtractor { ... }
```

---

### 8. Pipeline `[S-05]`

`onInvoiceCreate` runs extraction, anomaly detection, and recommendation as a sequential pipeline. Each step is independent and can fail without blocking the next.

```ts
await extractionService.run(invoice);
await anomalyService.run(invoice);
await recommendationService.run(invoice);
```

---

### 9. Builder `[S-05]`

AI prompts are constructed via builder functions, not string concatenation. Prompts are versioned constants in `functions/src/ai/prompts/`.

```ts
function buildExtractionPrompt(fileUrl: string): string {
  return `${SYSTEM_PROMPT}\n\nInvoice URL: ${fileUrl}\n\n${OUTPUT_FORMAT}`;
}
```

---

### 10. Observer `[S-07]`

Firestore real-time listeners (`onSnapshot`) are used for live data. Listeners are set up in custom hooks and cleaned up on unmount.

```ts
useEffect(() => {
  const unsubscribe = onSnapshot(invoicesQuery, (snap) => {
    store.setInvoices(snap.docs.map(toInvoice));
  });
  return unsubscribe;
}, []);
```

---

### 11. Decorator `[S-05]`

Claude and OpenAI API calls are wrapped with retry logic and logging. The decorator is transparent to the caller.

```ts
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    await backoff(retries);
    return withRetry(fn, retries - 1);
  }
}
```

---

### 12. Command `[S-10]`

Invoice actions (approve, reject, mark paid) are encapsulated as discrete command functions with pre-condition checks, execution, and audit logging.

```ts
async function approveInvoice(invoiceId: string, userId: string) {
  const invoice = await repo.findById(invoiceId);
  if (invoice.status !== "extracted") throw new InvalidTransitionError();
  await repo.save({ ...invoice, status: "approved", approvedBy: userId, approvedAt: now() });
}
```

---

### 13. Error Boundary `[S-07]`

React Error Boundaries wrap each major page section. Errors in one section do not crash the entire page.

```tsx
<ErrorBoundary fallback={<ErrorCard />}>
  <InvoiceList />
</ErrorBoundary>
```

---

### 14. Factory `[S-04]`

Domain objects are created via factory functions that apply defaults, generate IDs, and set timestamps. No `new` calls scattered across the codebase.

```ts
function createInvoice(input: CreateInvoiceInput): Invoice {
  return {
    id: generateId(),
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
    aiRecommendation: null,
    isAnomalous: false,
    ...input,
  };
}
```

---

## Common Hurdles & Solutions

### 1. Firebase Auth state flash on first render

**Problem:** `onAuthStateChanged` is async — on first load, auth state is `null` for a split second, causing a flash of unauthenticated UI or an incorrect redirect.

**Solution:** Initialize Zustand auth store with `status: 'loading'`. Render a loading state until `onAuthStateChanged` fires for the first time. Never redirect until status is `'authenticated'` or `'unauthenticated'`.

---

### 2. AI structured output validation failures

**Problem:** Claude occasionally returns malformed JSON, missing required fields, or wrong types.

**Solution:** Always parse Claude output with a Zod schema. If parsing fails, set invoice status to `extraction_failed` and surface the error. Never write unvalidated AI output to Firestore.

---

### 3. Firestore missing index errors on composite queries

**Problem:** Queries combining `where` + `orderBy` on different fields require composite indexes. Firestore throws an error at runtime with no warning at write time.

**Solution:** Create indexes in `firestore.indexes.json` upfront for all known composite queries. Run `firebase deploy --only firestore:indexes` before running integration tests.

---

### 4. Next.js middleware + Firebase Auth token verification

**Problem:** Firebase Auth client tokens cannot be verified in Next.js middleware without the Admin SDK, which cannot run in the Edge runtime.

**Solution:** Use Next.js middleware only to check for the presence of a session cookie. Do full token verification in Server Components or API routes using the Admin SDK with the Node.js runtime.

---

### 5. Zustand hydration mismatch with Next.js SSR

**Problem:** Zustand store is initialized on the server with empty state, then re-initialized on the client, causing React hydration mismatches.

**Solution:** Use Zustand's `createStore` with the `persist` middleware only on the client. Wrap store access in a `useEffect` or use the `skipHydration` option to defer until client mount.

---

### 6. Firebase emulators not starting before tests in CI

**Problem:** Integration tests run before the Firebase emulator is ready, causing connection failures.

**Solution:** Use `firebase emulators:exec` to wrap the test command — it starts emulators, runs tests, then shuts down. In GitHub Actions, add a health check step before running tests.

---

### 7. Claude API rate limits and transient failures

**Problem:** Claude API returns 429 (rate limit) or 5xx errors, causing `onInvoiceCreate` to fail silently.

**Solution:** Wrap all Claude API calls in a retry utility with exponential backoff (max 3 retries). On final failure, set invoice status to `extraction_failed` and log the error to Cloud Logging.

---

### 8. Firestore cursor pagination breaking with filters

**Problem:** `startAfter()` cursor-based pagination breaks when combined with `where()` filters — the cursor document may not match the filtered query.

**Solution:** Always fetch the cursor document from the same query that produced it. Pass the last document snapshot (not just its ID) to `startAfter()`. Re-run the full query with filters when pagination state changes.

---

### 9. Cloud Function cold start latency

**Problem:** First invocation after idle period takes 2–5 seconds, degrading user experience on `onInvoiceCreate`.

**Solution:** Set `minInstances: 1` on latency-sensitive functions in `firebase.json`. Accept cold starts on scheduled functions (`onSchedule`) since they are not user-facing.

---

### 10. Zod schema mismatches with AI output

**Problem:** Claude returns `null`, `undefined`, or extra fields not in the Zod schema, causing parse failures.

**Solution:** Use `.nullable()` and `.optional()` on fields that Claude may omit. Use `.strip()` on the Zod object to discard unexpected fields. Log raw Claude output alongside validation errors for debugging.

---

### 11. Firestore transaction conflicts on concurrent writes

**Problem:** Two users approving or updating the same invoice simultaneously causes one write to be lost.

**Solution:** Use Firestore transactions for all status transitions. Read the current status inside the transaction and reject the write if the status has already changed.

---

### 12. `onAuthStateChanged` firing multiple times on mount

**Problem:** Calling `onAuthStateChanged` in multiple components or hooks causes redundant state updates and re-renders.

**Solution:** Call `onAuthStateChanged` exactly once — in the root Zustand auth store initializer. All components read from the store, never subscribe to Firebase Auth directly.

---

### 13. Firebase Storage CORS blocking file uploads

**Problem:** Uploading files from the browser to Firebase Storage fails with a CORS error until Storage is explicitly configured.

**Solution:** Deploy a `cors.json` configuration to Firebase Storage via `gsutil cors set cors.json gs://{bucket}`. Allow `POST` and `PUT` from the app's origin. Do this before the first upload test.

---

### 14. Firestore security rules not covering subcollection paths

**Problem:** Rules written for `/invoices/{invoiceId}` do not automatically apply to `/organizations/{orgId}/invoices/{invoiceId}`. Missing rules silently deny or expose data.

**Solution:** Write explicit rules for every subcollection path used. Test all rules with the Firebase Emulator Suite's rules testing API before deploying.

---

### 15. Claude context window limits with large vendor history

**Problem:** S-13 (recommendation) passes vendor invoice history as context to Claude. Large vendors with hundreds of invoices exceed the context window.

**Solution:** Limit vendor history to the last 20 invoices when building the prompt. Summarize older history into aggregate statistics (average amount, rejection rate) rather than passing raw documents.

---

### 16. Environment variables not available in Cloud Functions in production

**Problem:** `functions/.env` works locally with the emulator but environment variables are not automatically deployed to production Cloud Functions.

**Solution:** Use Firebase Secret Manager for production secrets (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`). Reference them in `functions/src` via `defineSecret()`. Deploy secrets with `firebase deploy --only functions`.

---

### 17. Next.js App Router caching stale Firestore data

**Problem:** Next.js App Router aggressively caches `fetch` responses. Server Components reading Firestore data may return stale results.

**Solution:** Use Firestore client SDK with real-time listeners (`onSnapshot`) in Client Components for live data. For Server Components, pass `{ cache: 'no-store' }` to any fetch calls or use `revalidatePath` after mutations.

---

### 18. Husky hooks not running in CI

**Problem:** Husky pre-commit hooks are local only — CI does not run them automatically, creating a gap where failing code can be merged.

**Solution:** Replicate all hook checks as explicit CI steps: lint, commitlint, and tests each run as separate GitHub Actions steps. Husky is for developer convenience; CI is the enforcement layer.

---

### 19. pnpm workspace hoisting conflicts with shared types

**Problem:** Types in `shared/` are not resolved correctly in `apps/web` or `functions` because pnpm's hoisting rules exclude workspace packages from auto-resolution.

**Solution:** Add `shared` as an explicit workspace dependency in each package's `package.json`: `"@pagio/shared": "workspace:*"`. Import from `@pagio/shared` not via relative paths.

---

### 20. Firebase emulator data not persisting between test runs

**Problem:** Each test run starts with a clean emulator, but tests that depend on seed data fail if that data is not re-created each run, making tests order-dependent and fragile.

**Solution:** Create a `seed.ts` script that runs before the test suite to populate the emulator with known test data. Use `beforeEach` to reset document state for tests that mutate data.

---

## Environment Variables

Never hardcode secrets. Never commit `.env` files.

### Frontend — `apps/web/.env.local`

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_USE_EMULATOR=true   # set to false in production
```

### Functions — `functions/.env`

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

### CI — GitHub Actions Secrets

```
FIREBASE_SERVICE_ACCOUNT   # JSON service account for Firebase deployment
ANTHROPIC_API_KEY
OPENAI_API_KEY
```

### Rules

- `NEXT_PUBLIC_` variables are exposed to the browser — never put secrets there
- AI API keys live in Cloud Functions only — never in the frontend
- `.env.local` and `functions/.env` are gitignored
- Each developer maintains their own local `.env` files from a `.env.example` template

---

## Code Quality & Git Standards

These are mandatory. No exceptions.

### Commit Messages — Conventional Commits

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org) spec:

```
<type>(scope): <description>

feat(invoices): add AI extraction on upload
fix(auth): redirect unauthenticated users to sign-in
chore(ci): add GitHub Actions pipeline
```

**Allowed types:** `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `ci`

### Pre-commit Hooks — Husky

Husky enforces quality gates before every commit:

- **lint-staged** — runs ESLint + Prettier on staged files only
- **commitlint** — validates commit message format against Conventional Commits
- **tests** — all tests must pass before the commit is accepted
- Commit is blocked if any check fails — no exceptions

### Linting & Formatting

- **ESLint** — enforced on all `.ts` and `.tsx` files
- **Prettier** — enforced formatting, no manual style debates
- Both run in CI and as pre-commit hooks
- `pnpm lint` must pass before any merge

---

## Git Workflow — Gitflow

### Branch Structure

| Branch                      | Purpose                                                                       |
| --------------------------- | ----------------------------------------------------------------------------- |
| `main`                      | Production-ready code only. Never commit directly.                            |
| `develop`                   | Integration branch. All features merge here first.                            |
| `feature/<story-id>-<slug>` | One branch per user story (e.g. `feature/s-01-auth`). Branches off `develop`. |
| `release/<version>`         | Stabilisation before a production release. Branches off `develop`.            |
| `hotfix/<slug>`             | Emergency fixes for production. Branches off `main`.                          |

### Story Development Flow

```
develop
  └─ feature/s-01-auth        ← branch off develop
       ├─ test: write failing tests (RED)
       ├─ feat: implement minimal code (GREEN)
       ├─ refactor: clean up (GREEN)
       └─ merge back → develop via PR
```

1. **Start a story** — branch off `develop`:

   ```
   git checkout develop
   git checkout -b feature/s-01-auth
   ```

2. **Commit during development** — follow Conventional Commits on the feature branch.

3. **Open a PR** — `feature/*` → `develop`. CI must be green. No self-merging.

4. **Merge to develop** — squash or merge commit, delete the feature branch.

5. **Release** — when `develop` is stable, open `release/x.y.z` → `main`. Tag `main` with the version.

6. **Hotfix** — branch off `main`, fix, merge back to both `main` and `develop`.

### Rules

- `main` and `develop` are protected — no direct pushes
- Every story gets its own feature branch — no stacking features on one branch
- CI must pass before any merge
- PRs require at least a self-review pass of the diff before merging

---

## Methodology: Extreme Programming (XP)

### Development Cycle

```
Planning → Story Selection → TDD → Pair Programming
      → Refactoring → Continuous Integration → Feedback → Repeat
```

#### 1. Planning

- Define or review the iteration goal
- Estimate stories collaboratively
- Prioritize by business value

#### 2. Story Selection

- Pick stories from the backlog that fit the iteration
- Refine acceptance criteria before starting
- Stories must be `ready` before development begins

#### 3. TDD (Test-Driven Development)

```
Write failing test → RED
Implement minimal code → GREEN
Refactor → GREEN
Commit
```

No production code without a failing test first.

#### 4. Pair Programming

- All non-trivial code is written with a pair (or reviewed as if it were)
- Driver writes the code; navigator reviews intent and design
- Pairs rotate to spread knowledge

#### 5. Refactoring

- Happens continuously, not at the end
- Only refactor with passing tests as a safety net
- Goal: simple, readable, intention-revealing code

#### 6. Continuous Integration

- Push to `main` or open a PR at minimum once per story
- GitHub Actions runs: lint → typecheck → tests → build
- Broken CI blocks merging; fix it immediately

#### 7. Feedback

- Demo the increment (even to yourself)
- Validate against acceptance criteria
- Capture what changed in understanding → update stories or backlog

#### 8. Repeat

- Next story or next iteration starts with Planning

## User Story Format

Always write user stories in this exact structure:

- **As a** `[person or machine that uses the software]`
- **I want** `[a specific outcome from that software]`
- **So that** `[a task that is important is achieved]`

## Backlog

| ID   | Story                                                    | Status |
| ---- | -------------------------------------------------------- | ------ |
| S-01 | User can sign up and sign in                             | ready  |
| S-02 | User can sign out                                        | ready  |
| S-03 | User can manage vendors                                  | ready  |
| S-04 | User can upload an invoice                               | done   |
| S-05 | System extracts invoice data automatically on upload     | ready  |
| S-06 | User can correct AI-extracted invoice data               | ready  |
| S-07 | User can view their invoice list                         | ready  |
| S-08 | User can filter and sort the invoice list                | ready  |
| S-09 | User can view invoice details                            | ready  |
| S-10 | User can approve or reject an invoice                    | ready  |
| S-11 | User can mark an invoice as paid                         | ready  |
| S-12 | System flags anomalous invoices                          | ready  |
| S-13 | System recommends approve/reject based on vendor history | ready  |
| S-14 | User can query invoices in natural language              | ready  |
| S-15 | User can see a dashboard with invoice summary            | ready  |
| S-16 | System notifies user when an invoice is overdue          | ready  |
| S-17 | User can invite team members to their organization       | ready  |
| S-18 | User roles — approver vs. viewer                         | ready  |
| S-19 | User can export invoice data                             | ready  |

---

### S-01 — User can sign up and sign in `ready`

**As a** finance team member
**I want** to have an account on the platform
**So that** I can securely access and manage my organization's invoices

**Acceptance Criteria**

- [ ] User can register with a valid email and password
- [ ] User sees an error if the email is already in use
- [ ] User sees an error if the password is shorter than 8 characters
- [ ] User can sign in with valid credentials
- [ ] User sees an error when credentials are invalid
- [ ] After sign-in, user is redirected to the dashboard
- [ ] Unauthenticated users accessing protected pages are redirected to sign-in

**Out of Scope**

- Sign out — S-02
- Social login (Google, GitHub) — future story
- Password reset — future story

**Notes**

- Auth provider: Firebase Authentication (email/password)
- Auth state managed via Firebase `onAuthStateChanged`
- Route protection via Next.js middleware

---

### S-02 — User can sign out `ready`

**As a** finance team member
**I want** to sign out of the platform
**So that** my account remains secure when I'm not using it

**Acceptance Criteria**

- [ ] User can sign out from any page via a visible sign-out action
- [ ] After sign-out, user is redirected to the sign-in page
- [ ] After sign-out, user cannot access protected pages without signing in again

**Out of Scope**

- Session timeout / auto sign-out — future story

**Notes**

- Call Firebase `signOut()` and clear local auth state
- Depends on S-01

---

### S-03 — User can manage vendors `ready`

**As a** finance team member
**I want** to create and view vendors
**So that** I can associate invoices with the correct supplier

**Acceptance Criteria**

- [ ] User can create a vendor with name, email, and tax ID
- [ ] User sees an error if a vendor with the same tax ID already exists
- [ ] User can view a list of all vendors in their organization
- [ ] User can view a vendor's details

**Out of Scope**

- Editing or deleting vendors — future story
- Vendor payment history — future story

**Notes**

- Stored in Firestore `/vendors/{vendorId}` scoped to the organization
- Depends on S-01

---

### S-04 — User can upload an invoice `ready`

**As a** finance team member
**I want** to upload an invoice file to the platform
**So that** it can be processed and tracked in the system

**Acceptance Criteria**

- [ ] User can upload a PDF or image file (JPG, PNG)
- [ ] User sees an error if the file type is not supported
- [ ] User sees an error if the file exceeds 10 MB
- [ ] After upload, the invoice appears in the list with status `pending`
- [ ] User must select a vendor before uploading

**Out of Scope**

- Bulk upload — future story
- AI extraction — S-05

**Notes**

- File stored in Firebase Storage
- Invoice document created in Firestore `/invoices/{invoiceId}` on upload
- Depends on S-01, S-03

---

### S-05 — System extracts invoice data automatically on upload `ready`

**As a** system
**I want** to extract structured data from an uploaded invoice
**So that** the finance team does not have to enter invoice details manually

**Acceptance Criteria**

- [ ] On invoice upload, AI extracts: vendor, amount, due date, and line items
- [ ] Extracted data is saved to the invoice document in Firestore
- [ ] Invoice status changes to `extracted` after successful extraction
- [ ] If extraction fails, invoice status is set to `extraction_failed` and user is notified
- [ ] Extraction runs automatically without user action

**Out of Scope**

- Manual data entry as fallback — future story

**Notes**

- Triggered via `onInvoiceCreate` Cloud Function
- Uses Anthropic Claude API with structured output
- AI output validated before writing to Firestore
- Depends on S-04

---

### S-06 — User can correct AI-extracted invoice data `ready`

**As a** finance team member
**I want** to review and correct the data extracted from an invoice
**So that** errors from AI extraction do not propagate into the system

**Acceptance Criteria**

- [ ] User can edit extracted fields: amount, due date, line items
- [ ] User can save corrections and the invoice is updated in Firestore
- [ ] Corrected fields are visually distinguished from AI-extracted fields
- [ ] User cannot edit vendor — that is set at upload time

**Out of Scope**

- Re-running AI extraction after correction — future story

**Notes**

- Depends on S-05

---

### S-07 — User can view their invoice list `ready`

**As a** finance team member
**I want** to see a list of all invoices in my organization
**So that** I have full visibility of what needs attention

**Acceptance Criteria**

- [ ] User can see all invoices with: vendor name, amount, due date, and status
- [ ] List is paginated (20 items per page)
- [ ] Invoices are sorted by due date descending by default
- [ ] Each invoice links to its detail page

**Out of Scope**

- Filtering and sorting — S-08

**Notes**

- Reads from Firestore `/invoices` scoped to the organization
- Depends on S-01

---

### S-08 — User can filter and sort the invoice list `ready`

**As a** finance team member
**I want** to filter and sort the invoice list
**So that** I can quickly find the invoices that need my attention

**Acceptance Criteria**

- [ ] User can filter by status (pending, approved, rejected, paid)
- [ ] User can filter by vendor
- [ ] User can sort by amount or due date (ascending / descending)
- [ ] Active filters are visible and individually clearable

**Out of Scope**

- Saved filters — future story

**Notes**

- Depends on S-07

---

### S-09 — User can view invoice details `ready`

**As a** finance team member
**I want** to view the full details of an invoice
**So that** I have all the information needed to make an approval decision

**Acceptance Criteria**

- [ ] User can see all invoice fields: vendor, amount, due date, line items, status, and AI summary
- [ ] User can see the original uploaded file
- [ ] User can see the AI extraction confidence or any flagged anomalies

**Out of Scope**

- Editing from the detail page — S-06

**Notes**

- Depends on S-05

---

### S-10 — User can approve or reject an invoice `ready`

**As a** finance team member
**I want** to approve or reject an invoice
**So that** only valid invoices move forward for payment

**Acceptance Criteria**

- [ ] User can approve an invoice with status `extracted`
- [ ] User can reject an invoice with a required rejection reason
- [ ] Status updates to `approved` or `rejected` respectively
- [ ] Action is recorded with timestamp and user ID

**Out of Scope**

- Multi-step approval workflow — future story

**Notes**

- Status change triggers `onInvoiceStatusChange` Cloud Function
- Depends on S-09

---

### S-11 — User can mark an invoice as paid `ready`

**As a** finance team member
**I want** to mark an approved invoice as paid
**So that** the payment record is accurate and the invoice lifecycle is complete

**Acceptance Criteria**

- [ ] User can mark an invoice as paid only if its status is `approved`
- [ ] Status updates to `paid` with timestamp and user ID
- [ ] Paid invoices are visually distinct in the list

**Out of Scope**

- Payment integration (bank, Stripe) — future story

**Notes**

- Depends on S-10

---

### S-12 — System flags anomalous invoices `ready`

**As a** system
**I want** to detect invoices that deviate from a vendor's history
**So that** the finance team is alerted to potential fraud or errors before approving

**Acceptance Criteria**

- [ ] System compares new invoice amount against vendor's average invoice amount
- [ ] If deviation exceeds 30%, invoice is flagged as anomalous
- [ ] Flagged invoices show a visible warning on the list and detail page
- [ ] User can dismiss a flag with a reason

**Out of Scope**

- ML-based anomaly detection — future story

**Notes**

- Runs as part of the `onInvoiceCreate` Cloud Function pipeline
- Depends on S-05, S-03

---

### S-13 — System recommends approve/reject based on vendor history `ready`

**As a** system
**I want** to recommend an approval decision for each invoice
**So that** the finance team can make faster, more consistent decisions

**Acceptance Criteria**

- [ ] System generates a recommendation (`approve` or `reject`) for each invoice
- [ ] Recommendation is displayed on the invoice detail page with a brief reason
- [ ] User can override the recommendation freely
- [ ] If insufficient vendor history exists, no recommendation is shown

**Out of Scope**

- Auto-approving based on recommendation — future story

**Notes**

- Uses Anthropic Claude API with vendor history as context (in-context learning)
- Depends on S-05, S-03

---

### S-14 — User can query invoices in natural language `ready`

**As a** finance team member
**I want** to search invoices using plain language questions
**So that** I can find what I need without navigating filters manually

**Acceptance Criteria**

- [ ] User can type a natural language query (e.g. "overdue invoices from last month")
- [ ] System returns a filtered list of matching invoices
- [ ] If no results match, user sees a clear empty state message
- [ ] Query results link to individual invoice detail pages

**Out of Scope**

- Exporting query results — S-19
- Voice input — future story

**Notes**

- Uses Anthropic Claude API to translate query into Firestore filters
- Depends on S-07

---

### S-15 — User can see a dashboard with invoice summary `ready`

**As a** finance team member
**I want** to see a summary of my organization's invoice activity
**So that** I can quickly understand the current financial situation at a glance

**Acceptance Criteria**

- [ ] Dashboard shows total count and value of invoices by status (pending, approved, rejected, paid)
- [ ] Dashboard highlights overdue invoices with count and total value
- [ ] Dashboard shows invoices due in the next 7 days
- [ ] Each summary card links to the filtered invoice list

**Out of Scope**

- Charts and graphs — future story
- Custom date ranges — future story

**Notes**

- Depends on S-07

---

### S-16 — System notifies user when an invoice is overdue `ready`

**As a** system
**I want** to notify finance team members when an invoice passes its due date unpaid
**So that** overdue invoices are actioned before they create cash flow issues

**Acceptance Criteria**

- [ ] System sends an in-app notification when an invoice becomes overdue
- [ ] Notification includes vendor name, amount, and days overdue
- [ ] Notification links to the invoice detail page
- [ ] Each overdue invoice generates at most one notification per day

**Out of Scope**

- Email or SMS notifications — future story

**Notes**

- Triggered by a scheduled Cloud Function (`onSchedule`) running daily
- Depends on S-01, S-04

---

### S-17 — User can invite team members to their organization `ready`

**As a** finance team member
**I want** to invite colleagues to my organization on the platform
**So that** my team can collaborate on invoice management

**Acceptance Criteria**

- [ ] User can invite a colleague by email address
- [ ] Invitee receives an email with a sign-up link tied to the organization
- [ ] Invited user is added to the organization upon completing sign-up
- [ ] User sees an error if the email is already a member of the organization

**Out of Scope**

- Revoking invitations — future story
- Removing members — future story

**Notes**

- Invite link expires after 48 hours
- Depends on S-01

---

### S-18 — User roles — approver vs. viewer `ready`

**As a** finance team admin
**I want** to assign roles to team members
**So that** only authorized users can approve or reject invoices

**Acceptance Criteria**

- [ ] A user can have the role `approver` or `viewer`
- [ ] Only `approver` can approve, reject, or mark invoices as paid
- [ ] `viewer` can view invoices and the dashboard but cannot take actions
- [ ] Admin can change a member's role from the organization settings

**Out of Scope**

- Custom roles — future story
- Role-based access to specific vendors — future story

**Notes**

- Role stored on the user's organization membership document in Firestore
- Enforced in both UI and Firestore security rules
- Depends on S-17

---

### S-19 — User can export invoice data `ready`

**As a** finance team member
**I want** to export invoice data to a CSV file
**So that** I can share or process it in external tools like Excel

**Acceptance Criteria**

- [ ] User can export all invoices or the currently filtered list
- [ ] Export includes: vendor, amount, due date, status, and payment date
- [ ] File downloads automatically as a CSV
- [ ] Export button is available on the invoice list page

**Out of Scope**

- PDF export — future story
- Scheduled exports — future story

**Notes**

- Generated client-side from current Firestore query results
- Depends on S-07
