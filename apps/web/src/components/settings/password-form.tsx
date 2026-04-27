import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordData } from '@cellar/shared';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export interface PasswordFormProps {
  onSubmit: (data: ChangePasswordData) => Promise<void>;
}

export function PasswordForm({ onSubmit }: PasswordFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    control,
    setValue,
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      revokeOtherSessions: false,
    },
  });

  const handleFormSubmit = async (data: ChangePasswordData) => {
    try {
      clearErrors('root');
      await onSubmit(data);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  const [
    currentPassword = '',
    newPassword = '',
    confirmPassword = '',
    revokeOtherSessions = false,
  ] = useWatch({
    control,
    name: ['currentPassword', 'newPassword', 'confirmPassword', 'revokeOtherSessions'] as const,
  });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField label="Current Password" error={errors.currentPassword?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.currentPassword?.message}
          value={currentPassword}
          onChange={val => setValue('currentPassword', val)}
        />
      </FormField>

      <FormField label="New Password" error={errors.newPassword?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.newPassword?.message}
          value={newPassword}
          onChange={val => setValue('newPassword', val)}
        />
      </FormField>

      <FormField label="Confirm New Password" error={errors.confirmPassword?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          value={confirmPassword}
          onChange={val => setValue('confirmPassword', val)}
        />
      </FormField>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={revokeOtherSessions}
          onChange={e => setValue('revokeOtherSessions', e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-white/10 bg-surface-container text-primary focus:ring-primary/50"
        />
        <span className="text-xs text-on-surface-variant">Sign out all other devices</span>
      </label>

      <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
        Change Password
      </Button>
    </form>
  );
}
