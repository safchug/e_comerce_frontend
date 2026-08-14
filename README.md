# Ecommerce Frontend

React + Vite + TypeScript frontend for the API described in `openapi.json` (health check, register, login, refresh, logout, current user, admin users list).

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your API's URL
npm run dev
```

## Structure

- `src/api/client.ts` — axios instance; attaches the JWT to requests and silently refreshes it on a 401 using the refresh token.
- `src/api/auth.ts`, `src/api/health.ts` — one function per endpoint.
- `src/context/AuthContext.tsx` — holds the current user and exposes `login`, `register`, `logout`.
- `src/components/ProtectedRoute.tsx` — redirects to `/login` if not authenticated, or to `/profile` if `adminOnly` and the user isn't an ADMIN.
- `src/pages/` — `LoginPage`, `RegisterPage`, `ProfilePage` (`/users/me`), `AdminUsersPage` (`/users`), `HealthPage` (`/health`).
- `src/types.ts` — shared domain types mirroring the API DTOs.

Tokens are stored in `localStorage`. Swap `tokenStorage` in `src/api/client.ts` for a different storage strategy if needed.

Note: package versions weren't verified against the npm registry in this environment (registry access was blocked). Run `npm install` locally to pull current versions; adjust `package.json` if any package has since introduced breaking changes.
