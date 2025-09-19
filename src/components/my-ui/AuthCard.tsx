import React from 'react';
import { Form } from './Form';
import { FormConfig } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  // Ensure the submit button takes full width
  config.submitButtonClassName = 'w-full';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className={`max-w-md w-full ${className}`}>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            <Form config={config} />
          </CardContent>
          
          {footer && (
            <CardFooter className="justify-center border-t pt-6">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                {footer}
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default AuthCard;
