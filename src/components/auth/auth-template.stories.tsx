import type { Meta, StoryObj } from "@storybook/nextjs-vite";
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
};

export const WithoutSocialLogin: Story = {
  args: {
    headerSubtitle: "Sign in to your vault",
    form: <SignInForm />,
    footerPrompt: "Don't have an account?",
    footerLinkText: "Sign up",
    footerLinkHref: "/sign-up",
  },
};
