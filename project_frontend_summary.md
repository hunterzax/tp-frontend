# Frontend Project Structure & Replication Prompts

## Overview
The frontend is built with **Next.js (App Router)** and TypeScript. It features a sophisticated **Internationalization (i18n)** setup using dynamic routes (`[lng]`) and a custom **Authentication** flow that works in tandem with the backend API.

### Key Characteristics
1.  **Routing Strategy:**
    *   **Root:** `src/app/[lng]/` handles all localized routes.
    *   **Middleware:** `src/middleware.ts` manages language detection, redirection, and *Server-Side Token Validation*.
    *   **Protected Areas:** Routes under `authorization/` and `(authentication)/` are guarded.
2.  **State Management:**
    *   Uses **Redux Toolkit** for global state.
    *   Uses **Context API** for Theme (`ThemeContext`).
3.  **Authentication Flow:**
    *   **Login:** `src/app/[lng]/(authentication)/signin/` handles user login, calling local API proxies.
    *   **Token Storage:** Cookie (`v4r2d9z5m3h0c1p0x7l`) and `secureSessionStorage`.
    *   **Logout:** `Layout.tsx` handles logout by calling APIs and clearing storage.
4.  **Component Architecture:**
    *   **Headers:** `src/components/headers/` contains complex layout elements (Menus, TimeCount, Profile, Notification).
    *   **Utils:** `src/utils/postService.tsx` is a central Axios wrapper handling encryption, URL validation, and token injection.

---

## Folder Structure Summary

```text
src/
├── app/
│   ├── [lng]/
│   │   ├── (authentication)/   # Login, Forgot Password, Reset Password
│   │   ├── authorization/      # Main Protected Dashboard
│   │   ├── layout.tsx          # Root Layout (Theme Provider)
│   │   └── page.tsx            # Landing Page
│   └── api/                    # (Covered in previous summary)
├── components/
│   ├── headers/                # Layout components (Nav, Profile, Notifications)
│   ├── common/                 # Reusable UI components
│   └── other/                  # Modals, Popups
├── utils/
│   ├── postService.tsx         # Centralized API Service (Axios)
│   ├── cookie.ts               # Cookie helpers
│   └── apiAuthMiddleware.ts    # (Covered in previous summary)
└── middleware.ts               # Next.js Middleware (Auth & i18n)
```

---

## Replication Prompt

Use the following prompt to ask an AI to scaffold the frontend structure.

***

**System Role:** Expert Next.js Frontend Architect.

**Task:** Scaffold the **Frontend** structure for a secure, internationalized Next.js (App Router) application.

**Requirements:**

1.  **Project Structure:**
    *   Use `src/app/[lng]/` as the root for all pages to support i18n.
    *   Create a root layout `src/app/[lng]/layout.tsx` that wraps children in a server-side `ThemeContext` provider.

2.  **Middleware (`src/middleware.ts`):**
    *   Implement logic to handle localization (detect browser lang, redirect to default `en`).
    *   **Critical:** Implement **Server-Side Token Validation**. Check for a specific cookie (`v4r2d9z5m3h0c1p0x7l`). If missing on protected routes (like `/authorization`), redirect to `/signin`.
    *   Add Security Headers (CSP, X-Frame-Options, etc.).

3.  **Authentication Pages:**
    *   `src/app/[lng]/(authentication)/signin/page.tsx`:
        *   A "Client Component" featuring a login form.
        *   On submit, call a `postService` utility.
        *   On success, store the token in **Cookies** AND **SessionStorage**.
        *   Handle "Force Logout" or "Login Elsewhere" scenarios using a Modal component.

4.  **Main Dashboard (`src/app/[lng]/authorization/page.tsx`):**
    *   A protected "Client Component".
    *   Fetch dynamic "Menu Items" and "Announcements" from an API.
    *   Render a grid of menu links (e.g., to `/allocation`, `/planning`).
    *   Feature a `Marquee` footer for announcements.

5.  **Layout Components (`src/components/headers/`):**
    *   `Layout.tsx`: The main header containing Logo, Profile Dropdown, and Logout button.
    *   `Profile.tsx`: Display user info.
    *   `TimeCount.tsx`: A component showing the current server time/countdown.

6.  **Utility Service (`src/utils/postService.tsx`):**
    *   Create a centralized **Axios** wrapper.
    *   Features:
        *   Automatically inject `Authorization: Bearer <token>` from cookies/storage.
        *   **Security:** Validate all URLs using a helper (Anti-SSRF).
        *   Handle `encrypt/decrypt` of request/response payloads (stub functions are fine).

7.  **Tech Stack:**
    *   Styling: Tailwind CSS.
    *   Icons: MUI Icons (`@mui/icons-material`).
    *   Components: `headlessui` (optional, for dropdowns).
    *   State: React Context (Theme), Redux Toolkit (optional but recommended for Data).

**Output:**
Generate the code for:
1.  `middleware.ts`
2.  `src/utils/postService.tsx`
3.  `src/app/[lng]/layout.tsx`
4.  `src/components/headers/Layout.tsx` (Header Component)
5.  `src/app/[lng]/(authentication)/signin/page.tsx` (Skeleton logic)

***
