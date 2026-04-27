import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { PasswordForm } from './password-form';

const meta: Meta<typeof PasswordForm> = {
  component: PasswordForm,
  title: 'Settings/PasswordForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof PasswordForm>;

export const Default: Story = {
  args: {
    onSubmit: fn(async () => {}),
  },
};

export const Loading: Story = {
  args: {
    onSubmit: fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Current Password'), 'oldpassword');
    await userEvent.type(canvas.getByLabelText('New Password'), 'newpassword123');
    await userEvent.type(canvas.getByLabelText('Confirm New Password'), 'newpassword123');
    await userEvent.click(canvas.getByRole('button', { name: /change password/i }));
  },
};

export const WithValidationError: Story = {
  args: {
    onSubmit: fn(async () => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('New Password'), 'short');
    await userEvent.click(canvas.getByRole('button', { name: /change password/i }));
  },
};

export const WithPasswordMismatch: Story = {
  args: {
    onSubmit: fn(async () => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Current Password'), 'oldpassword');
    await userEvent.type(canvas.getByLabelText('New Password'), 'newpassword123');
    await userEvent.type(canvas.getByLabelText('Confirm New Password'), 'differentpassword');
    await userEvent.click(canvas.getByRole('button', { name: /change password/i }));
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('Invalid current password');
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Current Password'), 'wrongpassword');
    await userEvent.type(canvas.getByLabelText('New Password'), 'newpassword123');
    await userEvent.type(canvas.getByLabelText('Confirm New Password'), 'newpassword123');
    await userEvent.click(canvas.getByRole('button', { name: /change password/i }));
  },
};
