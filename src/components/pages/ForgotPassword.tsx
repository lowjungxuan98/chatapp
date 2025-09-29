"use client";

import AuthCard from '@/components/my-ui/AuthCard';
import { api } from '@/lib/api';
import { FormConfig, forgotPasswordSchema, ForgotPasswordData } from '@/types';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ForgotPassword() {
  const { locale } = useParams();
  const t = useTranslations('Auth');

  const forgotPasswordConfig: FormConfig<ForgotPasswordData> = {
    fields: [
      {
        name: 'email',
        label: t('fields.emailReset.label'),
        type: 'email',
        placeholder: t('fields.emailReset.placeholder'),
        required: true,
        autoComplete: 'email',
        description: t('fields.emailReset.description'),
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
    submitButtonText: t('forgotPassword.submitButton'),
    resetOnSubmit: true,
  };

  return (
    <AuthCard 
      title={t('forgotPassword.title')}
      subtitle={t('forgotPassword.subtitle')}
      config={forgotPasswordConfig}
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
