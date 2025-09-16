import { signIn } from "next-auth/react"
import AuthCard from '@/components/AuthCard';
import { FormConfig, loginSchema, LoginData } from '@/types';

const loginConfig: FormConfig<LoginData> = {
  fields: [
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
      placeholder: 'Enter your password',
      required: true,
      autoComplete: 'current-password',
    },
  ],
  schema: loginSchema,
  onSubmit: async (data) => {
    const res = await signIn(
      "credentials",
      {
        email: data.email,
        password: data.password,
        redirectTo: "/me"
      }
    )
  },
  submitButtonText: 'Sign In',
  resetOnSubmit: false,
};

export default function Login() {
  return (
    <AuthCard
      title="Sign In"
      subtitle="Welcome back! Please sign in to your account."
      config={loginConfig}
      footer={
        <div className="space-y-2">
          <div className="text-center">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              Forgot your password?
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
