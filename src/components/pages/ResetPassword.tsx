"use client";

import { useRouter, useParams } from 'next/navigation';
import AuthCard from '@/components/my-ui/AuthCard';
import { api } from '@/lib/api';
import { FormConfig, resetPasswordSchema, ResetPasswordData } from '@/types';
import { useTranslations } from 'next-intl';

interface ResetPasswordProps {
  token: string;
}

export default function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations('Auth');

  const resetPasswordConfig: FormConfig<ResetPasswordData> = {
    fields: [
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
    schema: resetPasswordSchema,
    onSubmit: async (data) => {
      try {
        const res = await api.resetPassword(token, data);
        if (res.success) {
          router.push(`/${locale}/me`);
        }
      } catch (error) {
        console.error('Reset password error:', error);
      }
    },
    submitButtonText: t('resetPassword.submitButton'),
    resetOnSubmit: true,
  };

  return (
    <AuthCard
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
      config={resetPasswordConfig}
      footer={
        <div className="space-y-2">
          <div className="text-center">
            <a href={`/${locale}/login`} className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              {t('links.backToSignIn')}
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
