# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a single-app repository. All frontend code lives in `simas-client-main/`.

## Commands

All commands must be run from `simas-client-main/`:

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run build:dev # Dev-mode build
npm run lint      # ESLint
npm run preview   # Preview production build
```

There is no test runner configured.

## Environment

Copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=<backend URL>  # ngrok URL for dev, Cloud Run URL for prod
```

The frontend does **not** use Supabase directly — Supabase is backend-only. The only env var the frontend needs is `VITE_API_BASE_URL`.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Radix primitives) + React Query + React Router v6 + Zod + React Hook Form

**Backend:** FastAPI on Google Cloud Run at `https://simas-webpage-485911123531.southamerica-east1.run.app`. All requests must include `ngrok-skip-browser-warning: true` header.

### Authentication Flow

Auth state is stored in `localStorage` under key `simas_auth`. The flow is:

1. `AuthContext` (`src/contexts/AuthContext.tsx`) manages login/register/logout state in React
2. `authApiClient` (`src/lib/authApiClient.ts`) is the low-level HTTP client that handles token refresh automatically — it proactively refreshes tokens 60s before expiry and retries 401s once
3. `apiClient` (`src/lib/apiClient.ts`) wraps `authApiClient` with typed API functions and domain types

`/auth/register` does NOT return an `access_token` — it only creates the account. The `AuthContext.register()` automatically calls `/auth/login` afterward to obtain tokens.

### API Client Layers

- `src/lib/authApiClient.ts` — core HTTP client (`authApi.get/post/patch/delete`, `authUpload`), `ApiError` class, token refresh logic
- `src/lib/apiClient.ts` — typed wrappers: `getDashboard()`, `updatePericia()`, `deletePericia()`, `uploadPericiaPDF()`, `getUazapiStatus()`, `connectUazapi()`
- All API errors throw `ApiError` with `.status`, `.detail`, `.isNetworkError`

### Route & Layout Structure

Routes are defined in `src/App.tsx`. All authenticated routes are wrapped with `<ProtectedRoute>` + `<AppLayout>` (sidebar layout). The sidebar is in `src/components/AppSidebar.tsx`.

Routes: `/login`, `/dashboard`, `/whatsapp`, `/tutorial`, `/configuracoes`

### Domain: Perícias

The core domain is "perícias" (medical/legal expert examinations). Key fields on `Pericia`:
- `status`: `"enviada" | "pendente" | "erro"` (computed by backend)
- `data`/`data_envio`: `YYYY-MM-DD` strings — use `parseLocalDate()` from `src/lib/utils.ts` to avoid timezone issues
- `numero`: WhatsApp phone in international format (digits only, e.g. `5585999999999`)
- Delete requires body `{ confirm: "delete" }` (soft delete — sets `excluida = true`)
- If `data` is updated without `data_envio`, backend auto-sets `data_envio = data - 7 days`

### Dashboard Components

All dashboard-specific components live in `src/components/dashboard/`. The main page `src/pages/Dashboard.tsx` fetches data via `getDashboard()` and passes it down. Filtering, pagination, and CRUD operations are handled through child components (`PericiaTable`, `EditPericiaSheet`, `DeletePericiaDialog`, etc.).

### WhatsApp Integration

The app integrates with Uazapi (WhatsApp Business API provider) via the backend. `useWhatsAppConnection` (`src/hooks/useWhatsAppConnection.ts`) manages connection state with polling every 4 seconds during the pairing flow. Pair codes are displayed to the user for manual entry in the WhatsApp app.

### Voice Assistant

An optional accessibility feature using the browser's Web Speech API. Preferences are persisted in `localStorage` under `simas_voice_assistant_prefs`. Managed by `VoiceAssistantContext` and `useVoiceAssistant` hook.

### Utility Conventions

- `src/lib/utils.ts` — `cn()` (Tailwind class merging), `parseLocalDate()`, date/color helpers
- `src/lib/toast-helpers.ts` — `showSuccessToast`, `showApiError`, etc. wrapping `sonner`
- `src/lib/validation-schemas.ts` — Zod schemas for forms (`loginSchema`, `registerSchema`, `periciaUpdateSchema`)
- UI components in `src/components/ui/` are all shadcn/ui — do not edit them directly, regenerate via shadcn CLI if needed
