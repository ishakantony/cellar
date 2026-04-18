'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileData } from '@/schemas/settings';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

export interface ProfileFormProps {
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  defaultValues?: Partial<UpdateProfileData>;
  userEmail: string;
}

export function ProfileForm({ onSubmit, defaultValues, userEmail }: ProfileFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: UpdateProfileData) => {
    try {
      clearErrors('root');
      await onSubmit(data);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  // Watch values for controlled inputs
  const name = watch('name') || '';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField label="Name" error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Your name"
          disabled={isSubmitting}
          error={errors.name?.message}
          value={name}
          onChange={val => setValue('name', val)}
        />
      </FormField>

      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input
          type="email"
          value={userEmail}
          disabled
          onChange={() => {}}
          className="cursor-not-allowed opacity-60"
        />
      </div>

      <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
        Save Changes
      </Button>
    </form>
  );
}
