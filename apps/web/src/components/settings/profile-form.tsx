import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileData } from '@cellar/shared';
import { Alert, Button, FormField, Input, Label } from '@cellar/ui';
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
    control,
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
  const name = useWatch({ control, name: 'name' }) || '';

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
