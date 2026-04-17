import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { SignInForm } from './sign-in-form';

const meta = {
  title: 'Auth/SignInForm',
  component: SignInForm,
  tags: ['autodocs'],
} satisfies Meta<typeof SignInForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    onSubmit: async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
  },
};

export const WithValidationError: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'invalid-email');
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Invalid credentials');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'wrongpassword');
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
  },
};

export const PreFilled: Story = {
  args: {
    defaultValues: {
      email: 'user@example.com',
      password: 'password123',
    },
  },
};
