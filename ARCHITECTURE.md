# Architecture — Carbon Footprint Awareness Platform

## System Overview

The Carbon Footprint Awareness Platform is a full-stack web application that enables individuals to track, analyze, and reduce their personal carbon emissions. The system follows a modern **layered architecture** pattern with clear separation of concerns between the frontend and backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            React 18 + TypeScript + TailwindCSS            │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │  │
│  │  │  Pages  │  │Components│  │  Hooks  │  │  Stores   │  │  │
│  │  │         │  │          │  │         │  │ (Zustand) │  │  │
│  │  └────┬────┘  └────┬─────┘  └────┬────┘  └─────┬─────┘  │  │
│  │       └─────────────┴─────────────┴─────────────┘        │  │
│  │                        │ Axios                            │  │
│  └────────────────────────┼──────────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────┼─────────────────────────────────────┐
│                     SERVER (Node.js)                            │
│  ┌────────────────────────┼──────────────────────────────────┐  │
│  │           Express.js + TypeScript                         │  │
│  │                        │                                  │  │
│  │  ┌─────────────────────▼──────────────────────────────┐   │  │
│  │  │              Middleware Stack                       │   │  │
│  │  │  CORS → Helmet → RateLimit → Auth → Validation     │   │  │
│  │  └─────────────────────┬──────────────────────────────┘   │  │
│  │                        │                                  │  │
│  │  ┌─────────────────────▼──────────────────────────────┐   │  │
│  │  │                 Routes Layer                        │   │  │
│  │  │  /auth  /footprint  /stats  /recommendations       │   │  │
│  │  └─────────────────────┬──────────────────────────────┘   │  │
│  │                        │                                  │  │
│  │  ┌─────────────────────▼──────────────────────────────┐   │  │
│  │  │              Controllers Layer                     │   │  │
│  │  │  AuthCtrl  FootprintCtrl  StatsCtrl  RecsCtrl      │   │  │
│  │  └─────────────────────┬──────────────────────────────┘   │  │
│  │                        │                                  │  │
│  │  ┌─────────────────────▼──────────────────────────────┐   │  │
│  │  │               Services Layer                       │   │  │
│  │  │  AuthSvc  FootprintSvc  EmissionsSvc  StatsSvc     │   │  │
│  │  │                  RecommendationsSvc                │   │  │
│  │  └─────────────────────┬──────────────────────────────┘   │  │
│  │                        │                                  │  │
│  │  ┌─────────────────────▼──────────────────────────────┐   │  │
│  │  │              Data Access Layer                     │   │  │
│  │  │           better-sqlite3 (SQLite)                  │   │  │
│  │  └────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Principles

### 1. Layered Architecture

The backend follows a strict layered architecture:

| Layer          | Responsibility                                        | Example             |
| -------------- | ----------------------------------------------------- | -------------------- |
| **Routes**     | HTTP endpoint definitions, middleware wiring          | `auth.routes.ts`     |
| **Controllers**| Request/response handling, HTTP status codes          | `auth.controller.ts` |
| **Services**   | Business logic, data transformation                  | `auth.service.ts`    |
| **Data Access**| Database queries, parameterized SQL                  | `database.ts`        |
| **Middleware** | Cross-cutting concerns (auth, validation, errors)     | `auth.middleware.ts` |

**Rule**: Each layer only communicates with the layer directly below it. Controllers never access the database directly; services never send HTTP responses.

### 2. Security by Default

Every request passes through the security middleware stack:

1. **CORS** — Whitelisted origins only
2. **Helmet** — Security headers (CSP, HSTS, X-Frame-Options, etc.)
3. **Rate Limiter** — 100 requests per 15 minutes per IP
4. **Authentication** — JWT verification on protected routes
5. **Validation** — Zod schema validation on all inputs

### 3. Type Safety

Both frontend and backend use TypeScript in strict mode with:
- No `any` types
- Explicit return types on all public functions
- Shared type definitions for API contracts
- Zod runtime validation matching TypeScript compile-time types

### 4. Component Architecture (Frontend)

```
Pages (route-level)
  └── Layout Components (structural)
       └── Feature Components (domain-specific)
            └── Common Components (reusable UI primitives)
```

State management uses Zustand with three stores:
- **authStore** — Authentication state and token management
- **footprintStore** — Activity data and statistics
- **uiStore** — Theme, sidebar, and toast notifications

## Data Flow

### Authentication Flow

```
User → LoginForm → authStore.login() → POST /api/v1/auth/login
                                              │
                                    AuthController.login()
                                              │
                                    AuthService.login()
                                              │
                               ┌──────────────┴──────────────┐
                               │                             │
                         UserService.findByEmail()    bcrypt.compare()
                               │                             │
                               └──────────────┬──────────────┘
                                              │
                                    JWT.sign(payload)
                                              │
                                    { accessToken, refreshToken }
                                              │
                               ← Response to client ←
                                              │
                               authStore.setTokens()
                               localStorage.persist()
```

### Carbon Logging Flow

```
User → ActivityLogger → footprintStore.logActivity()
                              │
                    POST /api/v1/footprint/log
                              │
                    FootprintController.logActivity()
                              │
                    Validation (Zod schema)
                              │
                    EmissionsService.calculateEmissions()
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        Transportation   Energy/Food    Shopping
        (km × factor)   (kWh × factor) ($ × factor)
              │               │               │
              └───────────────┼───────────────┘
                              │
                    FootprintService.logActivity()
                              │
                    INSERT INTO footprint_records
                              │
                    ← CO2 equivalent response ←
                              │
                    footprintStore.update()
                    Dashboard re-renders
```

## Database Schema

```sql
┌──────────────────────┐     ┌──────────────────────────────┐
│       users          │     │      footprint_records       │
├──────────────────────┤     ├──────────────────────────────┤
│ id (PK)              │────>│ id (PK)                      │
│ email (UNIQUE)       │     │ user_id (FK → users.id)      │
│ password_hash        │     │ category                     │
│ name                 │     │ activity_type                │
│ created_at           │     │ value                        │
│ updated_at           │     │ unit                         │
└──────────────────────┘     │ co2_equivalent               │
                             │ date                         │
                             │ notes                        │
                             │ created_at                   │
                             └──────────────────────────────┘

Indexes:
  - idx_footprint_user_date (user_id, date)
  - idx_footprint_category (user_id, category)
  - idx_users_email (email)
```

## API Design

All API endpoints follow REST conventions under `/api/v1/`:

| Method   | Endpoint                    | Auth | Description                    |
| -------- | --------------------------- | ---- | ------------------------------ |
| `POST`   | `/auth/register`            | No   | Create new user account        |
| `POST`   | `/auth/login`               | No   | Authenticate user              |
| `POST`   | `/auth/refresh`             | No   | Refresh access token           |
| `POST`   | `/auth/logout`              | Yes  | Invalidate session             |
| `GET`    | `/auth/me`                  | Yes  | Get current user profile       |
| `POST`   | `/footprint/log`            | Yes  | Log carbon-emitting activity   |
| `GET`    | `/footprint/today`          | Yes  | Today's emissions              |
| `GET`    | `/footprint/week`           | Yes  | This week's emissions          |
| `GET`    | `/footprint/month`          | Yes  | This month's emissions         |
| `GET`    | `/footprint/history`        | Yes  | Paginated activity history     |
| `DELETE` | `/footprint/:id`            | Yes  | Delete an activity record      |
| `GET`    | `/stats/summary`            | Yes  | Emissions summary & comparison |
| `GET`    | `/stats/breakdown`          | Yes  | Category-wise breakdown        |
| `GET`    | `/stats/trend`              | Yes  | Historical trend data          |
| `GET`    | `/stats/comparison`         | Yes  | Comparison against averages    |
| `GET`    | `/recommendations`          | Yes  | Personalized recommendations   |
| `GET`    | `/health`                   | No   | Server health check            |

### Response Format

All responses follow a consistent envelope:

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  }
}
```

## Performance Strategy

### Frontend
- **Code Splitting**: React.lazy for route-level splitting
- **Memoization**: React.memo for pure components, useMemo/useCallback for expensive computations
- **Bundle Optimization**: Vite tree-shaking, manual chunks for vendor/charts/state
- **Caching**: localStorage for auth tokens and user preferences

### Backend
- **Database Indexing**: Composite indexes on frequently queried columns
- **WAL Mode**: SQLite Write-Ahead Logging for concurrent read performance
- **Prepared Statements**: Pre-compiled SQL for repeated queries
- **Response Compression**: gzip compression via middleware

## Testing Strategy

```
                    ┌─────────────────────┐
                    │     E2E Tests       │  5 critical journeys
                    │  (User → API → DB)  │
                    ├─────────────────────┤
                    │  Integration Tests  │  15+ API endpoint tests
                    │  (Controller → DB)  │
                    ├─────────────────────┤
                    │    Unit Tests       │  45+ isolated tests
                    │ (Services, Utils)   │
                    └─────────────────────┘
Target: 80%+ overall coverage
```

## Deployment

The application supports Docker-based deployment:

```
docker-compose up --build
```

This starts:
- **Backend**: Node.js Express server on port 3001
- **Frontend**: Static files served via Nginx on port 5173

## Technology Decisions

| Decision              | Choice          | Rationale                                        |
| --------------------- | --------------- | ------------------------------------------------ |
| Database              | SQLite          | < 2MB footprint, zero-config, sufficient for MVP |
| State Management      | Zustand         | 4KB bundle, simple API, no boilerplate           |
| CSS Framework         | TailwindCSS v3  | Utility-first, tree-shakeable, rapid development |
| Auth                  | JWT + bcrypt    | Stateless auth, industry-standard hashing        |
| Validation            | Zod             | Runtime + compile-time type safety               |
| Charts                | Recharts        | React-native, composable, well-maintained        |
| Build Tool            | Vite            | < 2s builds, HMR, ESBuild-powered               |
