"use client";

import { signIn } from "next-auth/react"
import AuthCard from '@/components/my-ui/AuthCard';
import { FormConfig, loginSchema, LoginData } from '@/types';
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslations } from 'next-intl';

export default function Login() {
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations('Auth');

  const loginConfig: FormConfig<LoginData> = {
    fields: [
      {
        name: 'email',
        label: t('fields.email.label'),
        type: 'email',
        placeholder: t('fields.email.placeholder'),
        required: true,
        autoComplete: 'email',
      },
      {
        name: 'password',
        label: t('fields.password.label'),
        type: 'password',
        placeholder: t('fields.password.placeholder'),
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
            router.push(`/${locale}`);
        })
      }
    },
    submitButtonText: t('login.submitButton'),
    resetOnSubmit: false,
  };
  return (
    <AuthCard
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      config={loginConfig}
      footer={
        <div className="space-y-2">
          <div className="text-center">
            <a href={`/${locale}/forgot-password`} className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              {t('links.forgotPassword')}
            </a>
          </div>
          <div className="text-center">
            {t('links.dontHaveAccount')}{' '}
            <a href={`/${locale}/register`} className="font-medium text-blue-600 hover:text-blue-500">
              {t('links.signUp')}
            </a>
          </div>
        </div>
      }
    />
  );
}
