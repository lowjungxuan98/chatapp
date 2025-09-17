"use client";

import AuthCard from '@/components/my-ui/AuthCard';
import { api } from '@/lib/api';
import { FormConfig, forgotPasswordSchema, ForgotPasswordData } from '@/types';

const forgotPasswordConfig: FormConfig<ForgotPasswordData> = {
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
      autoComplete: 'email',
      description: 'We\'ll send you a link to reset your password',
    },
  ],
  schema: forgotPasswordSchema,
  onSubmit: async (data) => {
    try {
      await api.forgotPassword(data);
    } catch (error) {
      console.error('Forgot password error:', error);
    }
  },
  submitButtonText: 'Send Reset Link',
  resetOnSubmit: true,
};

export default function ForgotPassword() {
  return (
    <AuthCard 
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      config={forgotPasswordConfig}
      footer={
        <div className="space-y-2">
          <div className="text-center">
            <a href="/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              Back to Sign In
            </a>
          </div>
          <div className="text-center">
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </a>
          </div>
        </div>
      }
    />
  );
}
