import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toaster } from './sonner';
import { toast } from 'sonner';
import { Button } from './button';

const meta: Meta = {
  title: 'UI/Toast',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Toast notifications using sonner. These stories demonstrate the custom-styled toast variants used throughout the app. Click any button to trigger a toast.',
      },
    },
  },
  decorators: [
    Story => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Button variant="secondary" onClick={() => toast('Event has been created')}>
      Show Default Toast
    </Button>
  ),
};

export const Success: Story = {
  render: () => (
    <Button variant="primary" onClick={() => toast.success('Changes saved successfully')}>
      Show Success Toast
    </Button>
  ),
};

export const Error: Story = {
  render: () => (
    <Button variant="danger" onClick={() => toast.error('Failed to save changes')}>
      Show Error Toast
    </Button>
  ),
};

export const Info: Story = {
  render: () => (
    <Button variant="ghost" onClick={() => toast.info('New update available')}>
      Show Info Toast
    </Button>
  ),
};

export const Warning: Story = {
  render: () => (
    <Button variant="outline" onClick={() => toast.warning('Session expiring soon')}>
      Show Warning Toast
    </Button>
  ),
};

export const AllVariants: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" onClick={() => toast('Default toast message')}>
        Default
      </Button>
      <Button variant="primary" onClick={() => toast.success('Success toast message')}>
        Success
      </Button>
      <Button variant="danger" onClick={() => toast.error('Error toast message')}>
        Error
      </Button>
      <Button variant="ghost" onClick={() => toast.info('Info toast message')}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Warning toast message')}>
        Warning
      </Button>
    </div>
  ),
};
