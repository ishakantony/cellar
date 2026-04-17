"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInData } from "@/schemas/auth";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export interface SignInFormProps {
  onSubmit?: (data: SignInData) => Promise<void>;
  defaultValues?: Partial<SignInData>;
}

export function SignInForm({ onSubmit, defaultValues }: SignInFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
    trigger,
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues,
  });

  const handleFormSubmit = async (data: SignInData) => {
    try {
      clearErrors("root");
      await onSubmit?.(data);
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    }
  };

  // Get current values for controlled inputs
  const email = watch("email") || "";
  const password = watch("password") || "";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && (
        <Alert variant="error">{errors.root.message}</Alert>
      )}

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          value={email}
          onChange={(val) => {
            setValue("email", val, { shouldValidate: true });
          }}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.password?.message}
          value={password}
          onChange={(val) => {
            setValue("password", val, { shouldValidate: true });
          }}
        />
      </FormField>

      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
