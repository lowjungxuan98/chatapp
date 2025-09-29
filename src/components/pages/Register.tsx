"use client";

import AuthCard from '@/components/my-ui/AuthCard';
import { api } from '@/lib/api';
import { signIn } from "next-auth/react"
import { FormConfig, registerSchema, RegisterData } from '@/types';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Register() {
  const { locale } = useParams();
  const t = useTranslations('Auth');

  const registerConfig: FormConfig<RegisterData> = {
    fields: [
      {
        name: 'name',
        label: t('fields.fullName.label'),
        type: 'text',
        placeholder: t('fields.fullName.placeholder'),
        required: true,
        autoComplete: 'name',
      },
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
        label: t('fields.newPassword.label'),
        type: 'password',
        placeholder: t('fields.newPassword.placeholder'),
        required: true,
        autoComplete: 'new-password',
        description: t('fields.newPassword.description'),
      },
      {
        name: 'confirmPassword',
        label: t('fields.confirmPassword.label'),
        type: 'password',
        placeholder: t('fields.confirmPassword.placeholder'),
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
          redirectTo: `/${locale}/login`
        })
      }
    },
    submitButtonText: t('register.submitButton'),
    resetOnSubmit: true,
  };

  return (
    <AuthCard
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      config={registerConfig}
      footer={
        <span>
          {t('links.alreadyHaveAccount')}{' '}
          <a href={`/${locale}/login`} className="font-medium text-blue-600 hover:text-blue-500">
            {t('links.signIn')}
          </a>
        </span>
      }
    />
  );
}
