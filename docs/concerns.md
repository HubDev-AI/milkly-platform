# Concerns

## Story 1-2: Scaffold milkly-api

### C-1 — Rate limiter not applied to routes (Medium)
**Severity:** Medium
**Story:** 1-2
**Finding:** Rate limiting middleware (`src/middleware/rate-limit.ts`) is implemented but not applied to any route. Endpoints like `/auth/sso/token` and `/auth/sso/exchange` are unprotected against brute-force or replay-flooding attacks.
**Resolution:** Wire rate limiter in Story 1-3 or as a dedicated hardening story. Suggested: apply `createRateLimit(10, 60)` to SSO endpoints and `createRateLimit(5, 60)` to auth mutation routes.
**Deferred:** Gate 5 override accepted — rate limiting is infrastructure polish, not a correctness blocker.

### C-2 — X-Forwarded-For trusted without proxy validation (Medium)
**Severity:** Medium
**Story:** 1-2
**Finding:** `src/routes/auth.ts` reads `x-forwarded-for` for IP logging in session creation without verifying the request came through a trusted reverse proxy. A direct client can spoof this header, leading to misleading audit logs.
**Resolution:** When deployed to Railway, configure the load balancer to strip and re-set `x-forwarded-for`. Alternatively, add a trusted proxy check in the rate-limit / IP extraction logic. Address before production hardening.
**Deferred:** Gate 5 override accepted — logging-only impact in current implementation; no access control depends on IP.
