import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { SignUpForm } from './sign-up-form';

const meta = {
  title: 'Auth/SignUpForm',
  component: SignUpForm,
  tags: ['autodocs'],
} satisfies Meta<typeof SignUpForm>;

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
    await userEvent.type(canvas.getByLabelText('Name'), 'John Doe');
    await userEvent.type(canvas.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
  },
};

export const WithValidationError: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Email'), 'invalid-email');
    await userEvent.type(canvas.getByLabelText('Password'), 'short');
    await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error('Email already registered');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'John Doe');
    await userEvent.type(canvas.getByLabelText('Email'), 'existing@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'password123');
    await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
  },
};
