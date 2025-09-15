import React from 'react';
import { Form } from './Form';
import { FormConfig } from '@/lib/types/form';

interface AuthCardProps<T extends Record<string, unknown> = Record<string, unknown>> {
  title: string;
  subtitle?: string;
  config: FormConfig<T>;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthCard<T extends Record<string, unknown> = Record<string, unknown>>({
  title,
  subtitle,
  config,
  footer,
  className = ''
}: AuthCardProps<T>) {
  config.submitButtonClassName = 'w-full';
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full space-y-8 ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <Form config={config} />
          </div>

          {/* Footer */}
          {footer && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                {footer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthCard;
