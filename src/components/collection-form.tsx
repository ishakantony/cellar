'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCollectionSchema, type CreateCollectionInput } from '@/lib/validation';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ColorPicker, DEFAULT_COLOR_OPTIONS } from '@/components/ui/color-picker';
import { Label } from '@/components/ui/label';

export interface CollectionFormProps {
  onSubmit: (data: CreateCollectionInput) => Promise<void>;
  defaultValues?: Partial<CreateCollectionInput>;
  submitLabel?: string;
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export function CollectionForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Create',
  mode = 'create',
  onCancel,
}: CollectionFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<CreateCollectionInput>({
    resolver: zodResolver(CreateCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: CreateCollectionInput) => {
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
  const description = watch('description') || '';
  const color = watch('color') || '#3b82f6';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField label="Name" error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Collection name"
          disabled={isSubmitting}
          error={errors.name?.message}
          value={name}
          onChange={val => setValue('name', val)}
          autoFocus
        />
      </FormField>

      <FormField label="Description" error={errors.description?.message}>
        <Input
          type="text"
          placeholder="Optional description"
          disabled={isSubmitting}
          error={errors.description?.message}
          value={description}
          onChange={val => setValue('description', val)}
        />
      </FormField>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <ColorPicker
          value={color}
          onChange={val => setValue('color', val)}
          options={DEFAULT_COLOR_OPTIONS}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
