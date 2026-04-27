import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { ProfileForm } from './profile-form';

const meta: Meta<typeof ProfileForm> = {
  component: ProfileForm,
  title: 'Settings/ProfileForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof ProfileForm>;

export const Default: Story = {
  args: {
    onSubmit: fn(async () => {}),
    userEmail: 'user@example.com',
  },
};

export const PreFilled: Story = {
  args: {
    onSubmit: fn(async () => {}),
    defaultValues: {
      name: 'John Doe',
    },
    userEmail: 'john@example.com',
  },
};

export const Loading: Story = {
  args: {
    onSubmit: fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }),
    userEmail: 'user@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'New Name');
    await userEvent.click(canvas.getByRole('button', { name: /save changes/i }));
  },
};

export const WithValidationError: Story = {
  args: {
    onSubmit: fn(async () => {}),
    userEmail: 'user@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Clear the name field and submit
    const nameInput = canvas.getByLabelText('Name');
    await userEvent.clear(nameInput);
    await userEvent.click(canvas.getByRole('button', { name: /save changes/i }));
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('Failed to update profile');
    }),
    userEmail: 'user@example.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'New Name');
    await userEvent.click(canvas.getByRole('button', { name: /save changes/i }));
  },
};
