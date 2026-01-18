# Ultimate Project Replication Prompt

**System Role:** Elite Next.js Architect & Full-Stack Engineer.

**Objective:**
Reconstruct the **EXACT** project structure of a large-scale, enterprise Next.js (App Router) application. This prompt is based on a deep scan of an existing compilation-ready project. You must rigorously follow the directory tree and file responsibilities.

**Project Identity:**
- **Framework:** Next.js (App Router, Standalone Output) aka `web-main`
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Material Tailwind (`@material-tailwind/react`) + MUI Icons.
- **State Management:** Redux Toolkit (`src/utils/store`) + Context (Theme).
- **Internationalization:** Custom i18n with dynamic routing `[lng]` (`en`, `th`).
- **Security:** Custom JWT Middleware, Secure SessionStorage, Axios Interceptors with Encryption.

---

## 1. Directory Structure Master Plan

You must create (or plan for) the following structure. Pay attention to the **Custom Folder Locations** (e.g., `redux` is inside `utils/store`, `hooks` vs `hook`).

```text
/
├── .env                    # Config: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WEB_VERSION
├── next.config.mjs         # Standalone output, Sentry/PWA configs (commented out)
├── tailwind.config.ts      # With Material Tailwind wrapper & Custom Fonts
├── tsconfig.json           # Path alias: "@/*": ["./src/*"]
├── src/
│   ├── Interfaces/         # Shared TypeScript Interfaces
│   │   └── Interfaces.tsx
│   ├── app/
│   │   ├── i18n/           # Internationalization Logic
│   │   │   ├── locales/    # JSON dictionaries (en/th)
│   │   │   ├── client.ts   # Client-side i18n hook
│   │   │   └── settings.ts # Config (languages, defaultNamespace)
│   │   ├── [lng]/          # ROOT LOCALIZED PAGE
│   │   │   ├── (authentication)/
│   │   │   │   ├── signin/         # Login Page (Client Component)
│   │   │   │   ├── forgot-password/# Recovery
│   │   │   │   └── reset-password/ # Reset Logic
│   │   │   ├── authorization/      # PROTECTED AREA
│   │   │   │   ├── (menu)/         # Feature Modules
│   │   │   │   │   ├── allocation/
│   │   │   │   │   ├── balancing/
│   │   │   │   │   ├── booking/
│   │   │   │   │   ├── dam/
│   │   │   │   │   ├── dashboardandreport/
│   │   │   │   │   ├── event/
│   │   │   │   │   ├── metering/
│   │   │   │   │   ├── nominations/
│   │   │   │   │   ├── planning/
│   │   │   │   │   ├── profile/
│   │   │   │   │   └── tariff/
│   │   │   │   ├── layout.tsx      # Dashboard Layout (SideMenu + Navbar)
│   │   │   │   └── page.tsx        # Dashboard Landing (Menu Grid)
│   │   │   ├── layout.tsx          # Root Layout (ProvidersTheme)
│   │   │   └── page.tsx            # Redirector Page
│   │   └── api/                    # BACKEND CONTROLLERS
│   │       ├── auth/permissions/   # User Permissions Endpoint
│   │       ├── webservice/         # TPA Proxy Endpoint (Secure)
│   │       ├── meterservice/       # Meter Proxy Endpoint
│   │       ├── notifications/      # Gotify Integration
│   │       └── route.ts            # Health Check
│   ├── components/
│   │   ├── headers/                # Layout Components
│   │   │   ├── Layout.tsx          # Main Header
│   │   │   ├── AppMenu.tsx         # Sidebar
│   │   │   ├── BreadcrumbsMenu.tsx
│   │   │   ├── NotificationArea.tsx
│   │   │   ├── Profile.tsx         # User Dropdown
│   │   │   └── TimeCount.tsx       # Countdown Timer
│   │   ├── library/                # Specialized UI Libs
│   │   │   ├── dateRang/           # Date Range Pickers
│   │   │   ├── passwordStrong/     # Strength Meter
│   │   │   └── localCaptcha/       # Custom Captcha
│   │   ├── other/                  # Reusable "Common" Components
│   │   │   ├── searchForm.tsx      # Large Search Component
│   │   │   ├── fatherDynamicTable.tsx # Complex Data Table Wrapper
│   │   │   ├── btnExport.tsx       # Export Buttons (Excel/PDF)
│   │   │   ├── ResponseModal.tsx   # Global Modal
│   │   │   ├── spinLoading.tsx     # Loaders
│   │   │   └── renderPdf.tsx       # PDF Generation
│   │   └── material_custom/        # Material Tailwind Overrides
│   ├── context/
│   │   └── ThemeContext.tsx        # Theme Provider
│   ├── hook/                       # GENERAL DATA HOOKS
│   │   ├── fetchAllMaster.ts       # Master Data Fetcher
│   │   └── fetchMaster.ts
│   ├── hooks/                      # SPECIFIC LOGIC HOOKS
│   │   └── useUserPermissions.ts
│   ├── utils/
│   │   ├── store/                  # REDUX STORE
│   │   │   ├── slices/             # Redux Slices folder
│   │   │   ├── store.ts            # Configure Store
│   │   │   ├── ProviderRedux.tsx   # App Wrapper
│   │   │   └── ClientOnlyPersistGate.tsx
│   │   ├── postService.tsx         # CORE AXIOS SERVICE (Auto-Auth)
│   │   ├── apiAuthMiddleware.ts    # CORE API SECURITY (JWT)
│   │   ├── encryptionData.ts       # AES Encryption
│   │   ├── secureStorage.ts        # Storage Wrapper
│   │   ├── exportFunc.ts           # Excel/PDF Export Logic
│   │   └── generalFormatter.ts     # Data Formatter
│   └── middleware.ts               # NEXT.JS MIDDLEWARE (Auth + i18n)
```

---

## 2. Key Architecture Commands

### Authentication & Security (Priority 1)
- **Middleware (`middleware.ts`):** Must enforce `v4r2d9z5m3h0c1p0x7l` cookie check for `/authorization`. Redirect to `/signin` if missing.
- **API Security (`apiAuthMiddleware.ts`):** Wrap API routes with `withAuth`. verify JWT signature using `jose`.
- **Axios Interceptor (`postService.tsx`):** Every request must auto-attach `Authorization: Bearer <token>` from secure storage.
- **Session Security:** Use `secureStorage.ts` to wrap `sessionStorage` with encryption for sensitive keys like `x9f3w1m8q2y0u5d7v1z`.

### State Management (Redux)
- **Location:** `src/utils/store`.
- **Setup:** Create a `store.ts` using `@reduxjs/toolkit`.
- **Wrapper:** Create `ProviderRedux.tsx` to wrap the Root Layout.
- **Slices:** Create a placeholder slice (e.g., `userSlice`) in `slices/`.

### UI Component Strategy
- **Heavy Components:** The project uses "Father/Mother" table components (`fatherDynamicTable.tsx`). These are likely wrappers around `@tanstack/react-table` or `react-datasheet-grid` with built-in pagination/filtering.
- **Buttons:** Create specialized button components in `components/other` (e.g., `btnExport.tsx`, `btnSearch.tsx`).
- **Modals:** Single `ResponseModal.tsx` handles Success, Error, and Confirmation dialogs.

### Pages & Routing
- **Login (`signin/page.tsx`):**
    - Local Login (Calls `postService`).
    - Handles "Force Logout" scenarios.
    - Checks for "Term & Condition" (T&C).
- **Dashboard (`authorization/page.tsx`):**
    - Fetches Menu + Announcements.
    - Renders Grid.
    - Uses `react-fast-marquee`.

---

**Output Requirement:**
Generate the code for **at least 5 critical files** that act as the skeleton of this architecture:
1.  `src/utils/store/store.ts` (Redux Setup)
2.  `src/utils/postService.tsx` (Axios + Security)
3.  `src/components/headers/Layout.tsx` (Main Header)
4.  `src/app/[lng]/authorization/page.tsx` (Dashboard Logic)
5.  `src/app/[lng]/(authentication)/signin/page.tsx` (Login Logic)

Then, list the `npm install` commands needed to support this specific stack (including `jose`, `react-fast-marquee`, `axios`, `@material-tailwind/react`, etc.).
