import AuthCard from '../ui/AuthCard';
import { FormConfig, resetPasswordSchema, ResetPasswordData } from '../../lib/types';

const resetPasswordConfig: FormConfig<ResetPasswordData> = {
  fields: [
    {
      name: 'password',
      label: 'New Password',
      type: 'password',
      placeholder: 'Enter your new password',
      required: true,
      autoComplete: 'new-password',
      description: 'Must contain at least 8 characters with uppercase, lowercase, and numbers',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm New Password',
      type: 'password',
      placeholder: 'Confirm your new password',
      required: true,
      autoComplete: 'new-password',
    },
  ],
  schema: resetPasswordSchema,
  onSubmit: async (data) => {
    console.log('Reset password data:', data);
  },
  submitButtonText: 'Reset Password',
  resetOnSubmit: false,
};

export default function ResetPassword() {
  return (
    <AuthCard 
      title="Reset Password"
      subtitle="Enter your new password below."
      config={resetPasswordConfig}
      footer={
        <span>
          Remember your password?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Back to sign in
          </a>
        </span>
      }
    />
  );
}
