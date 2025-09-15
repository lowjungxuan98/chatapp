// API Manager exports
export { BaseApiManager } from './base';
export { AuthApiManager, authApi } from './auth';

// Type exports
export type {
  ApiResponse,
  User,
  TokenResponse,
  AuthTokensResponse,
  AuthResponse,
  HttpMethod,
  RequestConfig,
} from './types';

// Zod form types
export type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  SendVerificationEmailFormData,
} from '../validations/auth';

export { ApiError } from './types';

// Re-export the singleton instance for easy access
export { authApi as api } from './auth';
