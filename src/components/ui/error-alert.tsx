import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorAlertProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'خطأ',
  message,
  variant = 'destructive',
  className
}) => {
  return (
    <Alert variant={variant} className={cn('flex items-center gap-4', className)}>
      <AlertCircle className="h-4 w-4" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </div>
    </Alert>
  );
};