import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Modal } from './modal';
import { Button } from './button';

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'UI/Modal',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      story: { inline: false, iframeHeight: 300 },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Modal Title',
    children: (
      <p className="text-sm text-on-surface">
        This is the modal content. It can contain any React elements.
      </p>
    ),
    size: 'md',
  },
};

export const WithActions: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Confirm Action',
    children: (
      <p className="text-sm text-on-surface">
        Are you sure you want to perform this action? This cannot be undone.
      </p>
    ),
    actions: (
      <>
        <Button variant="ghost" onClick={fn()}>
          Cancel
        </Button>
        <Button variant="danger" onClick={fn()}>
          Confirm
        </Button>
      </>
    ),
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Small Modal',
    children: <p className="text-sm text-on-surface">This is a smaller modal dialog.</p>,
    size: 'sm',
  },
};

export const NoTitle: Story = {
  args: {
    open: true,
    onClose: fn(),
    children: (
      <div className="text-center">
        <p className="text-sm text-on-surface">Modal without a title bar.</p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
    title: 'Hidden Modal',
    children: <div>Not visible</div>,
  },
};
