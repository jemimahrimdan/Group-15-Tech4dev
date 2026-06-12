# Fix Email Verification

## Problem
Email verification link points to frontend (port 3000) but backend API is on port 3001.

## Files to Change

### 1. `.env` — Add `API_URL`
After `APP_URL=http://localhost:3000`, add:
```
API_URL=http://localhost:3001
```

### 2. `src/mail/mail.service.ts` — Use `API_URL` for links (2 changes)
**Line 9:** `sendVerificationEmail`
```typescript
// BEFORE:
const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
// AFTER:
const link = `${process.env.API_URL}/auth/verify-email?token=${token}`;
```

**Line 29:** `sendResetPasswordEmail`
```typescript
// BEFORE:
const link = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
// AFTER:
const link = `${process.env.API_URL}/auth/reset-password?token=${token}`;
```

### 3. `src/auth/auth.service.ts` — Fix console log URLs (2 changes)
**Line 61:** (register method)
```typescript
// BEFORE:
const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
// AFTER:
const verificationLink = `${process.env.API_URL}/auth/verify-email?token=${token}`;
```

**Line 270:** (resendVerification method)
```typescript
// BEFORE:
const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
// AFTER:
const verificationLink = `${process.env.API_URL}/auth/verify-email?token=${token}`;
```

### 4. `Caddyfile` — Fix backend port mismatch
```typescript
// BEFORE:
reverse_proxy app:3000
// AFTER:
reverse_proxy app:3001
```

### 5. `src/common/interceptors/response.interceptor.ts` — Fix double-wrapping
```typescript
// BEFORE (line 27):
const data = res?.data ?? res ?? null;
// AFTER:
const data = res?.data ?? null;
```

This prevents the interceptor from wrapping the entire response object into `data` when a service method returns `{ success, message }` without a `data` field.

---

## Testing on Postman (after fixes)

1. `POST http://localhost:3001/auth/register` → `{ fullName, email, password, role: "MENTEE" }`
2. Check server console for `VERIFY EMAIL LINK: http://localhost:3001/auth/verify-email?token=xxx`
3. `GET http://localhost:3001/auth/verify-email?token=xxx` → should return `{ success: true, message: "Email verified successfully", data: null }`
4. `POST http://localhost:3001/auth/login` → `{ email, password }` → should succeed
5. (After 1 hour) `GET http://localhost:3001/auth/verify-email?token=xxx` → should return `{ success: false, message: "Token expired" }`
6. `POST http://localhost:3001/auth/resend-verification` → `{ email }` → sends new link

## Re-verification Flow (already implemented)
- `POST /auth/resend-verification` with body `{ email }`
- Deletes old tokens, creates new one, sends fresh email
- Same `API_URL` fix applies to the console log in this method
