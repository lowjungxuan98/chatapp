# API Manager

A comprehensive TypeScript API manager for handling authentication and other API calls in the chat application.

## Structure

```
src/lib/api/
├── index.ts          # Main exports
├── types.ts          # TypeScript interfaces and types
├── base.ts           # Base API manager class
├── auth.ts           # Authentication API manager
└── README.md         # This file
```

## Usage

### Basic Usage

```typescript
import { authApi } from '@/lib/api';

// Login
try {
  const response = await authApi.login({
    email: 'user@example.com',
    password: 'password123'
  });
  
  if (response.success) {
    console.log('Login successful:', response.data);
    // authApi automatically handles token storage
  }
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Available Methods

#### Authentication (`authApi`)

- `login(credentials)` - User login
- `register(userData)` - User registration
- `forgotPassword(email)` - Send password reset email
- `resetPassword(password, token)` - Reset password with token
- `verifyEmail(token)` - Verify email with token
- `sendVerificationEmail(email)` - Send verification email
- `logout()` - Clear authentication state
- `setSession(authResponse)` - Set user session after login
- `isAuthenticated()` - Check if user is logged in

## API Endpoints

All methods correspond to the following API endpoints:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password?token={token}`
- `POST /api/auth/verify-email?token={token}`
- `POST /api/auth/send-verification-email`

## Error Handling

The API manager includes comprehensive error handling:

```typescript
try {
  const response = await authApi.login(credentials);
} catch (error) {
  if (error instanceof ApiError) {
    console.log('Status:', error.statusCode);
    console.log('Message:', error.message);
  }
}
```

## Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}
```

## TypeScript Support

Full TypeScript support with proper type inference:

```typescript
// TypeScript knows this returns ApiResponse<AuthResponse>
const loginResponse = await authApi.login(credentials);

// TypeScript knows this returns ApiResponse<string>
const resetResponse = await authApi.forgotPassword({ email });
```

## Extending the API Manager

To add new endpoints, extend the `BaseApiManager`:

```typescript
import { BaseApiManager } from './base';

class CustomApiManager extends BaseApiManager {
  async customEndpoint(data: any) {
    return this.post('/custom/endpoint', data);
  }
}
```
