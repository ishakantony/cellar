import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextLink } from './text-link';

const meta = {
  title: 'UI/TextLink',
  component: TextLink,
  tags: ['autodocs'],
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '/sign-up',
    children: 'Sign up',
  },
};

export const LongText: Story = {
  args: {
    href: '/forgot-password',
    children: 'Forgot your password?',
  },
};
