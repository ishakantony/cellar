import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthHeader } from "./auth-header";

const meta = {
  title: "Auth/AuthHeader",
  component: AuthHeader,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    subtitle: "Sign in to your vault",
  },
};

export const SignUp: Story = {
  args: {
    subtitle: "Create your vault",
  },
};
