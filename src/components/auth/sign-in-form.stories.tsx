import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SignInForm } from "./sign-in-form";

const meta = {
  title: "Auth/SignInForm",
  component: SignInForm,
  tags: ["autodocs"],
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
  },
};

export const WithValidationError: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Submit with invalid email to see validation errors",
      },
    },
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error("Invalid credentials");
    },
  },
};

export const PreFilled: Story = {
  args: {
    defaultValues: {
      email: "user@example.com",
      password: "password123",
    },
  },
};
