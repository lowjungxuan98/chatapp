# API Structure Rules

## Overview
All API endpoints in this project must follow a consistent structure with exactly 4 files:
- `middleware.ts` - Request validation and middleware handling
- `route.ts` - HTTP route handlers and response formatting
- `service.ts` - Business logic and data operations
- `validate.ts` - Data validation schemas and types

## File Structure
```
src/app/api/[endpoint-name]/
├── middleware.ts
├── route.ts
├── service.ts
└── validate.ts
```

## Why 4 Files Are Required

### 1. `middleware.ts` - Request Validation & Middleware
**Purpose**: Handles request validation, authentication, and preprocessing before reaching the main handler.

**Why it's needed**:
- **Separation of Concerns**: Keeps validation logic separate from business logic
- **Reusability**: Can be shared across multiple routes
- **Consistency**: Ensures all requests go through the same validation pipeline
- **Error Handling**: Centralizes validation errors and provides consistent error responses

**Example from login API**:
```typescript
export const RouteMiddleware = <T = unknown>(handler: Handler<T>): Handler<T> => 
  GlobalMiddleware(loginBodySchema)<T>(async (req) => {
    return handler(req);
  });
```

### 2. `route.ts` - HTTP Route Handlers
**Purpose**: Defines the actual HTTP endpoints (GET, POST, PUT, DELETE) and handles request/response formatting.

**Why it's needed**:
- **Next.js Integration**: Follows Next.js App Router conventions
- **Response Standardization**: Ensures all API responses follow the same format
- **Error Handling**: Provides consistent error responses across all endpoints
- **HTTP Method Support**: Supports multiple HTTP methods in a single file

**Example from login API**:
```typescript
export const POST = RouteMiddleware<LoginResponse>(async (request: NextRequest) => {
  // Handle POST request logic
});
```

### 3. `service.ts` - Business Logic
**Purpose**: Contains the core business logic, database operations, and external service calls.

**Why it's needed**:
- **Testability**: Business logic can be unit tested independently
- **Reusability**: Services can be called from multiple routes or other services
- **Maintainability**: Business logic is centralized and easier to modify
- **Separation of Concerns**: Keeps route handlers focused on HTTP concerns only

**Example from login API**:
```typescript
const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Business logic for authentication
};
```

### 4. `validate.ts` - Data Validation & Types
**Purpose**: Defines Zod schemas for request validation and TypeScript types for responses.

**Why it's needed**:
- **Type Safety**: Provides TypeScript types for better development experience
- **Runtime Validation**: Zod schemas ensure data integrity at runtime
- **Documentation**: Serves as API contract documentation
- **Consistency**: Ensures all endpoints use the same validation patterns

**Example from login API**:
```typescript
export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginResponse = {
  id: string;
  email: string;
  // ... other fields
};
```

## Creating a New API Endpoint

### Step-by-Step Instructions

1. **Create the folder structure**:
   ```bash
   mkdir -p src/app/api/[your-endpoint-name]
   ```

2. **Create `validate.ts` first**:
   - Define Zod schemas for request validation
   - Include schemas for all inputs your route expects:
     - **Body**: `[endpoint]BodySchema`
     - **Query**: `[endpoint]QuerySchema` (optional, if applicable)
     - **Path Params**: e.g., `userIdParamSchema`
   - Export TypeScript response types (shape of `data`) used by the route(s)
   - Follow the naming convention: `[endpoint]BodySchema`, `[endpoint]QuerySchema`, `[Endpoint]Response`

3. **Create `service.ts`**:
   - Implement business logic functions and database operations (using Prisma)
   - Never import `NextRequest`/`NextResponse` here
   - Do not return sensitive fields (e.g., passwords); use Prisma `select` to whitelist fields
   - Throw domain-specific `Error` messages that routes can map to HTTP status codes (e.g., `"User not found"`, `"User with this email or username already exists"`, `"Invalid password"`)
   - Export as a default object with named functions (e.g., `{ login, signUp }`)

4. **Create `middleware.ts`**:
   - Import validation schemas from `validate.ts`
   - Use `GlobalMiddleware(schema)` for methods expecting JSON bodies (it auto-validates and returns 400 on failure)
   - If no body is expected, use `GlobalMiddleware()` without a schema
   - Export a generic `RouteMiddleware<T>` wrapper and use it in `route.ts`

5. **Create `route.ts`**:
   - Import from your service, middleware, and validation files
   - Export one constant per HTTP method you support: `export const GET/POST/PUT/DELETE`
   - Wrap handlers with `RouteMiddleware<YourResponseType>` when body validation is needed
   - Use `NextResponse.json<ApiResponse<YourResponseType>>({...}, { status })`
   - Return `201` for successful creations, `200` for successful reads/updates/deletes
   - Map known domain errors to specific HTTP status codes (see mapping below); otherwise return `500`
   - For dynamic routes (e.g., `[id]`), you may import shared `service`/`validate` from the parent folder

### Core Rules Checklist (follow these for every endpoint)

- **4-file pattern**: `middleware.ts`, `route.ts`, `service.ts`, `validate.ts`
- **Type-safe responses**: Always return `ApiResponse<T>` from routes
- **JSON body validation**: Use `GlobalMiddleware(schema)` in `middleware.ts` and wrap routes with `RouteMiddleware`
- **No sensitive data**: Service must `select` only safe fields to return
- **HTTP status discipline**:
  - 200: success (GET/PUT/DELETE)
  - 201: created (POST)
  - 400: invalid request body (handled by `GlobalMiddleware`)
  - 401: authentication failures (if applicable)
  - 404: not found (e.g., `"User not found"`)
  - 409: conflict (e.g., `"User with this email or username already exists"`)
  - 500: unexpected errors
- **Error messages**: Throw clear, exact messages in `service.ts` so routes can map to statuses
- **Dynamic routes**: Place parameterized handlers in `src/app/api/[endpoint]/[param]/route.ts`
- **Query/param validation**: Define Zod schemas in `validate.ts` and parse them in the route before calling `service`
- **Logging**: Optional; avoid logging sensitive data
- **OpenAPI sync**: Update `public/openapi.json` for every new/changed endpoint

### Response Format Standard
All APIs must return responses in this format:
```typescript
{
  success: boolean;
  message: string;
  data?: T;        // Success case
  error?: unknown; // Error case
}
```

### Status Codes & Error Mapping
- **400**: Returned automatically by `GlobalMiddleware(schema)` when JSON body validation fails
- **401**: Use when authentication fails (e.g., invalid/expired token, if/when auth is enforced)
- **404**: Map `Error('User not found')` to 404 (and similar not-found cases)
- **409**: Map `Error('User with this email or username already exists')` (and other conflict cases) to 409
- **500**: Any unexpected error; return a generic failure message and include `error` for diagnostics

### Dynamic Routes
- Create parameterized directories: `src/app/api/[resource]/[param]/route.ts`
- Reuse parent `service.ts` and `validate.ts` when possible (e.g., `users/[id]` reuses `users/service.ts` and `users/validate.ts`)
- Validate path params in the route using a Zod schema (e.g., `userIdParamSchema`)

### OpenAPI Specification
- For any new/updated endpoint, reflect it in `public/openapi.json`:
  - Add/modify the `paths` entry (methods, parameters, requestBody)
  - Reference shared `components/schemas` where possible
  - Ensure success and error responses align with `ApiResponse<T>` and the error shape

### Error Handling
- Use try-catch blocks in route handlers
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging

### Naming Conventions
- **Files**: lowercase with hyphens (kebab-case)
- **Functions**: camelCase
- **Types**: PascalCase
- **Schemas**: camelCase with "Schema" suffix

## Benefits of This Structure

1. **Maintainability**: Clear separation of concerns makes code easier to maintain
2. **Testability**: Each layer can be tested independently
3. **Scalability**: Easy to add new endpoints following the same pattern
4. **Consistency**: All APIs behave predictably
5. **Type Safety**: Full TypeScript support throughout the stack
6. **Validation**: Runtime validation ensures data integrity
7. **Error Handling**: Consistent error responses across all endpoints

## Example Implementation
See the existing implementations in:
- `src/app/api/auth/login/` - Authentication endpoint
- `src/app/api/auth/register/` - User registration
- `src/app/api/hello/` - Simple test endpoint

These serve as templates for creating new API endpoints following the established patterns.
