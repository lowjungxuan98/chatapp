import { User } from '@prisma/client';
import { BaseApiManager } from './base';
import {
  ApiResponse,
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData
} from '@/types';

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
  async login(credentials: LoginData): Promise<ApiResponse<User>> {
    return this.post<User>('/auth/login', credentials);
  }

  /**
   * User registration
   * POST /api/auth/register
   */
  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    return this.post<User>('/auth/register', userData);
  }

  /**
   * Forgot password request
   * POST /api/auth/forgot-password
   */
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<string>> {
    return this.post<string>('/auth/forgot-password', data);
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password?token=TOKEN
   */
  async resetPassword(token: string, data: ResetPasswordData): Promise<ApiResponse<User>> {
    return this.post<User>(`/auth/reset-password?token=${encodeURIComponent(token)}`, data);
  }
}

// Create and export a singleton instance
export const authApi = new AuthApiManager();
