import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "@storybook/test";
import { AuthTemplate } from "./auth-template";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { SocialLoginSection } from "./social-login-section";

const meta = {
  title: "Auth/AuthTemplate",
  component: AuthTemplate,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSignInForm: Story = {
  args: {
    headerSubtitle: "Sign in to your vault",
    form: <SignInForm />,
    socialLogin: <SocialLoginSection />,
    footerPrompt: "Don't have an account?",
    footerLinkText: "Sign up",
    footerLinkHref: "/sign-up",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "test@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
  },
};

export const WithSignUpForm: Story = {
  args: {
    headerSubtitle: "Create your vault",
    form: <SignUpForm />,
    socialLogin: <SocialLoginSection />,
    footerPrompt: "Already have an account?",
    footerLinkText: "Sign in",
    footerLinkHref: "/sign-in",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Name"), "John Doe");
    await userEvent.type(canvas.getByLabelText("Email"), "john@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: /create account/i }));
  },
};

export const WithoutSocialLogin: Story = {
  args: {
    headerSubtitle: "Sign in to your vault",
    form: <SignInForm />,
    footerPrompt: "Don't have an account?",
    footerLinkText: "Sign up",
    footerLinkHref: "/sign-up",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("Email"), "test@example.com");
    await userEvent.type(canvas.getByLabelText("Password"), "password123");
    await userEvent.click(canvas.getByRole("button", { name: /sign in/i }));
  },
};
