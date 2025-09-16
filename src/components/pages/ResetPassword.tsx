import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/api';
import { FormConfig, resetPasswordSchema, ResetPasswordData } from '@/types';

interface ResetPasswordProps {
  token: string;
}

export default function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();

  const resetPasswordConfig: FormConfig<ResetPasswordData> = {
    fields: [
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Create a password',
        required: true,
        autoComplete: 'new-password',
        description: 'Must contain at least 8 characters with uppercase, lowercase, and numbers',
      },
      {
        name: 'confirmPassword',
        label: 'Confirm Password',
        type: 'password',
        placeholder: 'Confirm your password',
        required: true,
        autoComplete: 'new-password',
      },
    ],
    schema: resetPasswordSchema,
    onSubmit: async (data) => {
      try {
        const res = await api.resetPassword(token, data);
        if (res.success) {
          router.push("/me");
        }
      } catch (error) {
        console.error('Reset password error:', error);
      }
    },
    submitButtonText: 'Reset Password',
    resetOnSubmit: true,
  };

  return (
    <AuthCard
      title="Reset Password"
      subtitle="Enter your new password below."
      config={resetPasswordConfig}
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
