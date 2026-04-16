import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Alert } from './alert';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'UI/Alert',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['error', 'success'] },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your changes have been saved successfully.',
  },
};

export const LongError: Story = {
  args: {
    variant: 'error',
    children: 'Unable to connect to the server. Please check your internet connection and try again later.',
  },
};

export const LongSuccess: Story = {
  args: {
    variant: 'success',
    children: 'The file has been uploaded successfully and is now being processed. You will receive a notification when complete.',
  },
};
