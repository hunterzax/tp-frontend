# Project Controllers Summary

## Overview
The project uses the **Next.js App Router** framework. "Controllers" are implemented as API Route Handlers located in `src/app/api`.
The architecture heavily relies on a **Proxy Pattern** to communicate with upstream internal services (TPA System, Gotify), coupled with a robust **Authentication & Authorization Middleware** (`withAuth`) that ensures security compliance (CWE fixes).

### Key Technologies
- **Framework:** Next.js (App Router)
- **Authentication:** Custom JWT-based middleware using `jose`
- **Permissions:** Role-based and fine-grained permission checks (`f_view`, `f_noti_inapp`, etc.)
- **Upstream Services:** TPA System (IIS/ASP.NET), Gotify (Notifications)

---

## Controller Details

### 1. Web Service Proxy (`app/api/webservice/route.ts`)
**Type:** `GET`, `OPTIONS`
**Security:** `CRITICAL` (Requires `f_view` permission)
**Functionality:**
- Acts as a secure proxy to the TPA System (`TPA_WEBCONFIG_UAT`).
- **Authentication:** Validates JWT from cookie/header via `withAuth`.
- **Authorization:** Checks if the user has `f_view` permission.
- **Proxying:** Forwards the request to the upstream server, injecting secure `access-token` and `jwt_token` from environment variables (never exposed to client).
- **CORS:** Handles CORS preflight (`OPTIONS`) with a strictly whitelisted processing of `ALLOWED_ORIGINS`.

### 2. Notifications Service (`app/api/notifications/route.ts`)
**Type:** `GET`
**Security:** Requires Authentication & `f_noti_inapp` permission.
**Functionality:**
- Fetches user notifications from a **Gotify** server.
- **Security:**
  - Validates `gotifyToken` and sanitizes headers.
  - Whitelists Gotify domains (`gotify.i24.dev`, `localhost`).
  - **Data Isolation:** Enforces checks so users can only fetch *their own* notifications (unless Admin).
- **Logic:** implementation includes filtering messages by user email.

### 3. Meter Service Simple Proxy (`app/api/meterservice/route.ts`)
**Type:** `GET`
**Functionality:**
- A simpler, less restrictive version of the Web Service proxy.
- Proxies requests to `TPA_WEBCONFIG_UAT/Manage/AllMeter`.
- Sets `no-store` cache control for real-time data.

### 4. Auth Permissions (`app/api/auth/permissions/route.ts`)
**Type:** `GET`, `OPTIONS`
**Security:** Authenticated Users
**Functionality:**
- Serves as the **Source of Truth** for user permissions.
- Returns the user's permission set (fetched from DB/Mock in middleware logic) instead of relying on client-side storage.
- Used by the frontend to determine UI element visibility.

### 5. Root API (`app/api/route.ts`)
**Type:** `GET`
**Functionality:**
- A basic health/demo endpoint.
- Validates `NEXT_PUBLIC_DEMO_API` and proxies a request to a Pokemon API.
- Demonstrates URL validation security fixes (Anti-SSRF).

---

## Middleware Architecture (`utils/apiAuthMiddleware.ts`)
All secure controllers are wrapped with a Higher-Order Function `withAuth(handler, config)`.
1.  **Token Extraction:** Reads Bearer token or `v4r2d9z5m3h0c1p0x7l` cookie.
2.  **Validation:** Verifies JWT signature using `jose`.
3.  **Permission Fetching:** Retrieves user roles/permissions (Mock/DB).
4.  **Authorization:** Checks `requiredPermission` or `requiredRole` defined in the route config.
5.  **Audit:** Logs access (User, Endpoint, IP).

---

# Prompt for Project Replication

Use the following prompt to ask an AI to create a project with this structure:

***

**System Role:** Expert Next.js Architect specializing in Secure API Gateway patterns.

**Task:** Create a Next.js (App Router) project skeleton that replicates a "Secure Proxy API" architecture.

**Requirements:**
1.  **Tech Stack:** Next.js, TypeScript, `jose` (for JWT), `next-intl` (setup structure only).
2.  **Core Feature:** Implement a robust **Authentication Middleware HOC** named `withAuth` in `src/utils/apiAuthMiddleware.ts`.
    *   It must accept a handler and a config (`requiredPermission`, `allowPublic`).
    *   It must validate JWT tokens using `jose`.
    *   It must mock fetching permissions (e.g., `f_view`, `f_edit`) for the user.
    *   It must handle Audit Logging (console log mock).
3.  **Controllers (API Routes):** Create the following routes in `src/app/api`:
    *   `webservice/route.ts`: A secure proxy (GET) to an external URL (mock `https://api.upstream.com`). It must require `f_view` permission, handle CORS explicitly (whitelist), and inject a server-side secret token into the upstream request.
    *   `notifications/route.ts`: A secure endpoint (GET) that calls a notification service (Gotify-style). It must require `f_noti_inapp` permission and ensure users can only fetch their own data.
    *   `auth/permissions/route.ts`: An endpoint returning the authenticated user's permissions.
4.  **Security Standards:**
    *   Apply fixes for **CWE-284** (Improper Access Control) by strictly enforcing the middleware.
    *   Apply fixes for **CWE-918** (SSRF) by validating all upstream URLs.
    *   Apply fixes for **CWE-942** (CORS) by using whitelisted origins, not wildcards.

**Output:**
Provide the full code for `apiAuthMiddleware.ts` and the `route.ts` files for the controllers mentioned. Ensure the directory structure matches specifically `src/app/api/...`.

***
