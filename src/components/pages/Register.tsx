import AuthCard from '@/components/AuthCard';
import { api } from '@/lib/api';
import { signIn } from "next-auth/react"
import { FormConfig, registerSchema, RegisterData } from '@/types';

const registerConfig: FormConfig<RegisterData> = {
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      required: true,
      autoComplete: 'name',
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email',
      required: true,
      autoComplete: 'email',
    },
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
  schema: registerSchema,
  onSubmit: async (data) => {
    const res = await api.register(data);
    if (res.success) {
      await signIn("nodemailer", {
        email: data.email,
        redirectTo: "/me"
      })
    }
  },
  submitButtonText: 'Create Account',
  resetOnSubmit: true,
};

export default function Register() {
  return (
    <AuthCard
      title="Create Account"
      subtitle="Join us today! Create your account to get started."
      config={registerConfig}
      footer={
        <span>
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </span>
      }
    />
  );
}
