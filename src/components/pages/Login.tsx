"use client";

import { signIn } from "next-auth/react"
import AuthCard from '@/components/my-ui/AuthCard';
import { FormConfig, loginSchema, LoginData } from '@/types';
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Login() {
  const router = useRouter();

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
      const res = await api.login({ email: data.email, password: data.password });
      if (res.success) {
        await signIn("credentials", {
          id: res.data.id,
          name: res.data.name,
          image: res.data.image,
          email: data.email,
          redirect: false
        }).then((res) => {
          if (!res.error)
            router.push("/");
        })
      }
    },
    submitButtonText: 'Sign In',
    resetOnSubmit: false,
  };
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
