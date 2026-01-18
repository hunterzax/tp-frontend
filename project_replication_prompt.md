# Comprehensive Project Replication Prompt

**System Role:** Expert Next.js System Architect & Security Specialist.

**Objective:**
Replicate the exact project structure of a secure, enterprise-grade Next.js (App Router) application. You must create **every single folder and file skeleton** listed below to ensure a 1:1 match with the reference architecture.

**Tech Stack:**
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, MUI (@mui/icons-material)
- **State:** Redux Toolkit, Context API (Theme)
- **Auth:** Custom JWT Middleware + SessionStorage
- **Utils:** Axios with Interceptors, Encryption Helpers

---

## 1. Directory Structure Blueprint
You must create the following directory tree. For leaf nodes, create a placeholder file (e.g., `page.tsx` or `index.ts`) unless specified otherwise.

```text
src/
├── app/
│   ├── [lng]/                          # Dynamic Route for Internationalization
│   │   ├── (authentication)/           # Auth Pages Group
│   │   │   ├── signin/                 # Login Page (Client Component)
│   │   │   ├── forgot-password/        # Recovery Flow
│   │   │   └── reset-password/         # Password Reset Flow
│   │   ├── authorization/              # Protected Dashboard Group
│   │   │   ├── (menu)/                 # Main Menu Modules
│   │   │   │   ├── allocation/         # Module: Allocation
│   │   │   │   ├── balancing/          # Module: Balancing
│   │   │   │   ├── booking/            # Module: Booking
│   │   │   │   ├── dam/                # Module: DAM
│   │   │   │   ├── dashboardandreport/ # Module: Reports
│   │   │   │   ├── event/              # Module: Events
│   │   │   │   ├── metering/           # Module: Metering
│   │   │   │   ├── nominations/        # Module: Nominations
│   │   │   │   ├── planning/           # Module: Planning
│   │   │   │   ├── profile/            # Module: User Profile
│   │   │   │   └── tariff/             # Module: Tariff
│   │   │   ├── layout.tsx              # Dashboard Layout Wrapper
│   │   │   └── page.tsx                # Dashboard Landing (Menu Grid)
│   │   ├── layout.tsx                  # Root Layout (Theme Provider)
│   │   └── page.tsx                    # Landing / Redirector
│   └── api/                            # API Route Handlers (Controllers)
│       ├── auth/
│       │   └── permissions/            # GET: User Permissions
│       ├── webservice/                 # PROXY: Secure connection to upstream TPA
│       ├── notifications/              # GET: Notifications from Gotify
│       ├── meterservice/               # PROXY: Simple Meter Data
│       └── route.ts                    # Health Check / Demo
├── components/
│   ├── headers/                        # Core Layout Components
│   │   ├── Layout.tsx                  # Main Header (Logo, Logout)
│   │   ├── Profile.tsx                 # User Profile Dropdown
│   │   ├── TimeCount.tsx               # Server Time Display
│   │   ├── NotificationArea.tsx        # Notification Bell & Drawer
│   │   ├── BreadcrumbsMenu.tsx         # Navigation Breadcrumbs
│   │   └── AppMenu.tsx                 # Mobile/Side Menu
│   ├── other/                          # Shared UI Elements
│   │   ├── ResponseModal.tsx           # Standard Success/Error Modal
│   │   └── Loading.tsx                 # Loading Spinner
│   └── tables/                         # Data Display
│       └── DataTable.tsx               # Reusable Table Component
├── context/
│   └── ThemeContext.tsx                # Next-Themes Provider Wrapper
├── utils/
│   ├── postService.tsx                 # CORE: Axios Wrapper (Auto-Inject Token)
│   ├── apiAuthMiddleware.ts            # CORE: HOC for API Route Security
│   ├── cookie.ts                       # Helper: Get/Set Cookies
│   ├── encryptionData.ts               # Helper: AES Encryption/Decryption
│   └── secureStorage.ts                # Helper: Secure SessionStorage Wrapper
├── middleware.ts                       # Next.js Middleware (Auth & i18n)
└── layout.tsx                          # Root App Layout
```

---

## 2. Implementation Details

### A. Core Architecture (Mus Have)

1.  **Middleware (`src/middleware.ts`):**
    *   **Logic:**
        1.  Detect Language from URL or Cookie.
        2.  **Server-Side Auth:** Check `req.cookies.get('v4r2d9z5m3h0c1p0x7l')`.
        3.  If trying to access `/authorization/*` without token -> Redirect to `/signin`.
        4.  Inject security headers (CSP, X-Frame-Options).

2.  **API Security (`src/utils/apiAuthMiddleware.ts`):**
    *   Create a Higher-Order Function `withAuth`.
    *   It must:
        *   Verify JWT (using `jose` library).
        *   Check for `requiredPermission` (e.g., `f_view`).
        *   Log access attempts (Audit Trail).

3.  **HTTP Service (`src/utils/postService.tsx`):**
    *   Create `getService`, `postService`.
    *   **Auto-Auth:** Always read token from Cookie/Storage and add `Authorization: Bearer ...`.
    *   **Safety:** Validate URL paths to prevent SSRF before sending requests.

### B. Module & Page Logic

4.  **Login Page (`(authentication)/signin/page.tsx`):**
    *   Client Component using `useState`.
    *   On Submit -> Call `postService('/master/account-manage/account-local')`.
    *   On Success -> Save token to Cookie & `sessionStorage`.
    *   Handle "Force Logout": Check response for 403/Duplicate Login -> Show Modal.

5.  **Main Dashboard (`authorization/page.tsx`):**
    *   **Dynamic Menu:** Fetch menu items from API.
    *   **Grid Layout:** Render links to the modules (Allocation, Balancing, etc.).
    *   **Footer:** Show `Marquee` with announcements.

6.  **Proxy Controller (`app/api/webservice/route.ts`):**
    *   **Secure Proxy:** Forward requests to an upstream server (Mock URL).
    *   **Headers:** Inject a Secret Server Token (from `process.env`) that the client NEVER sees.
    *   **CORS:** Whitelist specific origins.

### C. Specific Components

7.  **Layout Component (`components/headers/Layout.tsx`):**
    *   Must include the Corporate Logo.
    *   Must include `Profile` component.
    *   Must include a Logout button that calls a clear-storage utility.

---

**Output Instruction:**
Please generate the code for the following critical files to start the scaffolding:
1.  `src/middleware.ts`
2.  `src/utils/postService.tsx`
3.  `src/app/api/webservice/route.ts`
4.  `src/app/[lng]/authorization/page.tsx`
5.  `src/components/headers/Layout.tsx`

Then, confirm that you have created the folder structure exactly as requested.
