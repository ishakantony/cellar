"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpData } from "@/schemas/auth";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export interface SignUpFormProps {
  onSubmit?: (data: SignUpData) => Promise<void>;
  defaultValues?: Partial<SignUpData>;
}

export function SignUpForm({ onSubmit, defaultValues }: SignUpFormProps) {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      ...defaultValues,
    },
  });

  const handleFormSubmit = async (data: SignUpData) => {
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
  const name = watch("name") || "";
  const email = watch("email") || "";
  const password = watch("password") || "";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {errors.root && (
        <Alert variant="error">{errors.root.message}</Alert>
      )}

      <FormField label="Name" error={errors.name?.message}>
        <Input
          type="text"
          placeholder="Your name"
          disabled={isSubmitting}
          error={errors.name?.message}
          value={name}
          onChange={(val) => setValue("name", val)}
        />
      </FormField>

      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          value={email}
          onChange={(val) => setValue("email", val)}
        />
      </FormField>

      <FormField label="Password" error={errors.password?.message}>
        <Input
          type="password"
          placeholder="••••••••"
          disabled={isSubmitting}
          error={errors.password?.message}
          value={password}
          onChange={(val) => setValue("password", val)}
        />
      </FormField>

      <Button type="submit" loading={isSubmitting} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
