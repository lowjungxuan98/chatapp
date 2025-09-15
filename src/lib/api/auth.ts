import { BaseApiManager } from './base';
import {
  ApiResponse,
  AuthResponse,
} from './types';
import { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  ResetPasswordFormData,
  SendVerificationEmailFormData 
} from '../validations/auth';

/**
 * Authentication API Manager
 * Handles all authentication-related API calls
 */
export class AuthApiManager extends BaseApiManager {
  constructor() {
    super('/api');
  }

  /**
   * User login
   * POST /api/auth/login
   */
  async login(credentials: LoginFormData): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * User registration
   * POST /api/auth/register
   */
  async register(userData: RegisterFormData): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>('/auth/register', userData);
  }

  /**
   * Forgot password - send reset email
   * POST /api/auth/forgot-password
   */
  async forgotPassword(request: ForgotPasswordFormData): Promise<ApiResponse<string>> {
    return this.post<string>('/auth/forgot-password', request);
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password?token={token}
   */
  async resetPassword(
    resetData: ResetPasswordFormData,
    token: string
  ): Promise<ApiResponse<void>> {
    return this.post<void>('/auth/reset-password', resetData, { token });
  }

  /**
   * Verify email with token
   * POST /api/auth/verify-email?token={token}
   */
  async verifyEmail(token: string): Promise<ApiResponse<never>> {
    return this.post<never>('/auth/verify-email', {}, { token });
  }

  /**
   * Send verification email
   * POST /api/auth/send-verification-email
   */
  async sendVerificationEmail(
    request: SendVerificationEmailFormData
  ): Promise<ApiResponse<string>> {
    return this.post<string>('/auth/send-verification-email', request);
  }

  /**
   * Logout (client-side token cleanup)
   * This method clears the stored auth token
   */
  logout(): void {
    this.removeAuthToken();
    // Additional cleanup can be added here (localStorage, sessionStorage, etc.)
  }

  /**
   * Set user session after successful login/register
   */
  setSession(authResponse: AuthResponse): void {
    this.setAuthToken(authResponse.tokens.access.token);
    // You can add additional session storage logic here
    // localStorage.setItem('user', JSON.stringify(authResponse.user));
    // localStorage.setItem('tokens', JSON.stringify(authResponse.tokens));
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    // This is a simple check - in production you might want to verify token expiry
    return 'Authorization' in this['defaultHeaders'];
  }
}

// Create and export a singleton instance
export const authApi = new AuthApiManager();
