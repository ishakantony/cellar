import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthFooter } from './auth-footer';

const meta = {
  title: 'Auth/AuthFooter',
  component: AuthFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof AuthFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    prompt: "Don't have an account?",
    linkText: 'Sign up',
    linkHref: '/sign-up',
  },
};

export const SignUp: Story = {
  args: {
    prompt: 'Already have an account?',
    linkText: 'Sign in',
    linkHref: '/sign-in',
  },
};
