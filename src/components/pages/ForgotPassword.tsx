import AuthCard from '../ui/AuthCard';
import { FormConfig } from '../../lib/types/form';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../lib/validations/auth';

const forgotPasswordConfig: FormConfig<ForgotPasswordFormData> = {
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
      autoComplete: 'email',
      description: 'We\'ll send a password reset link to this email address',
    },
  ],
  schema: forgotPasswordSchema,
  onSubmit: async (data) => {
    console.log('Forgot password data:', data);
  },
  submitButtonText: 'Send Reset Link',
  resetOnSubmit: true,
};

export default function ForgotPassword() {
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      config={forgotPasswordConfig}
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