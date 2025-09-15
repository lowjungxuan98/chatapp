## API Architecture Rules (ChatApp)

Keep this simple and consistent. All endpoints follow the same structure: validate → auth (if required) → route → service → typed response.

### Folder layout per endpoint
- Each endpoint lives under `src/app/api/<feature>/<action>/`
  - `validate.ts`: Zod schema for `query` and `body`
  - `middleware.ts`: Wraps handler with `GlobalMiddleware(schema)`
  - `service.ts`: Business logic (Prisma, crypto, jwt, email)
  - `route.ts`: Next.js Route Handler (parses input, calls service, returns `ApiResponse`)

Example folders in this repo:
- `auth/login`, `auth/register`, `auth/forgot-password`, `auth/reset-password`, `auth/send-verification-email`, `auth/verify-email`

### Request lifecycle
1) `GlobalMiddleware(schema)` (`src/app/api/middleware.ts`)
   - Validates `req.nextUrl.searchParams` as `query`
   - Parses JSON body (empty `{}` if none) and validates as `body`
   - If path is whitelisted (public), skip auth
   - Else, require `Authorization: Bearer <access_token>`, verify, and set `request.user`
2) `route.ts`
   - Read `NextRequest`, extract input, call service
   - Catch `ApiError` for controlled failures, otherwise return 500
3) `service.ts`
   - Use Prisma for DB operations
   - Use helpers: `crypto.ts` (password), `jwt.ts` (tokens), `email.ts` (mail)
   - Throw `new ApiError(statusCode, message)` for business errors
4) Response shape is always `ApiResponse<T>`

### Validation (Zod)
- File: `validate.ts`
- Export a schema named for the action, e.g. `loginSchema`
- Schema shape is always:
  - `query: z.object({...})`
  - `body: z.object({...})`

### Middleware
- File: `middleware.ts`
- Export `RouteMiddleware` that applies `GlobalMiddleware(schema)` to a handler:
```ts
export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(schema)<T>(handler);
```
- Public routes must be added to whitelist in `src/app/api/middleware.ts` (`whitelistedPaths`).

### Route handler
- File: `route.ts`
- Export HTTP method(s) (e.g., `export const POST = RouteMiddleware<Resp>(async (req) => { ... })`)
- Parse input, call service, return `NextResponse.json<ApiResponse<Resp>>(...)`
- Handle `ApiError` with its `statusCode`; unknown errors → 500

### Services
- File: `service.ts`
- Instantiate PrismaClient locally (`new PrismaClient()`)
- Keep pure business logic here; no `NextResponse` in services
- Throw `ApiError` on failures; do not return error-like data

### Typed responses
- Use `ApiResponse<T>` and `Handler<T>` from `src/app/api/type.ts`
- Success: `{ success: true, message, data? }`
- Error: `{ success: false, message, error? }`

### Authentication and JWT
- File: `src/app/api/jwt.ts`
- Access tokens: created with `sign(user, minutes)`; verified in `GlobalMiddleware`
- Refresh tokens: created + persisted via `saveToken(..., TokenType.REFRESH, ...)`
- Reset/Verify email tokens: created + persisted; validated with `verify(token, TokenType.<...>)`
- Non-access token verification also checks DB presence and `blacklisted=false`

Main helpers:
- `generateAuthTokens(user)` → `{ access, refresh }`
- `generateResetPasswordToken(email)` → token saved in DB
- `generateVerifyEmailToken(user)` → token saved in DB
- `verify(token, type)` → returns `{ user?, token? }`

Required env vars for JWT:
- `JWT_SECRET`
- Optional: `JWT_ISSUER`, `JWT_AUDIENCE`
- Expirations: `JWT_ACCESS_EXPIRATION_MINUTES`, `JWT_REFRESH_EXPIRATION_DAYS`, `JWT_RESET_PASSWORD_EXPIRATION_MINUTES`, `JWT_VERIFY_EMAIL_EXPIRATION_MINUTES`

### Passwords (Crypto)
- File: `src/app/api/crypto.ts`
- `encrypt(password)` with Argon2 on create/update
- `verify(hash, password)` on login

### Email
- File: `src/app/api/email.ts`
- Use `sendEmail(to, subject, text)`
- Helpers: `sendResetPasswordEmail(to, token)`, `sendVerificationEmail(to, token)`
- SMTP env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `EMAIL_FROM`

### Adding a new endpoint (checklist)
1) Create folder: `src/app/api/<feature>/<action>/`
2) Add `validate.ts` with `query` and `body` schemas (Zod)
3) Add `middleware.ts` exporting `RouteMiddleware` using your schema
4) Add `service.ts` with Prisma/business logic; throw `ApiError` on failure
5) Add `route.ts` using `RouteMiddleware`, call service, return typed `ApiResponse`
6) If public, add full path to `whitelistedPaths` in `src/app/api/middleware.ts`
7) Use `encrypt/verify` for passwords, `jwt` helpers for tokens, `email` helpers for mail
8) Keep responses and errors consistent with `ApiResponse`

### Minimal route skeleton
```ts
// validate.ts
export const myActionSchema = z.object({ query: z.object({}), body: z.object({}) });

// middleware.ts
export const RouteMiddleware = <T>(handler: Handler<T>) => GlobalMiddleware(myActionSchema)<T>(handler);

// service.ts
export const myAction = async (args: Args): Promise<Result> => { /* ... */ };

// route.ts
export const POST = RouteMiddleware<Result>(async (req) => {
  try {
    const body = await req.json();
    const result = await myAction(body);
    return NextResponse.json({ success: true, message: 'OK', data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, message: error.message, error }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: 'Internal Server Error', error }, { status: 500 });
  }
});
```

### Conventions
- Use explicit file names: `validate.ts`, `middleware.ts`, `service.ts`, `route.ts`
- Name schemas `<action>Schema`
- Always return `ApiResponse<T>` from routes
- Services never return `NextResponse`
- Public endpoints must be whitelisted; everything else requires a Bearer access token


