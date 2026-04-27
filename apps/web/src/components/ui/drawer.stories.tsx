import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Drawer } from './drawer';
import { Button } from './button';

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  title: 'UI/Drawer',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 400 },
    },
  },
  argTypes: {
    open: { control: 'boolean' },
    width: { control: 'select', options: ['md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Drawer Title',
    children: (
      <div className="p-6">
        <p className="text-sm text-on-surface">This is the drawer content.</p>
      </div>
    ),
    width: 'lg',
  },
};

export const WithFooter: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Settings',
    children: (
      <div className="p-6">
        <p className="text-sm text-on-surface">Configure your preferences here.</p>
      </div>
    ),
    footer: (
      <>
        <Button variant="ghost" onClick={fn()}>
          Cancel
        </Button>
        <Button onClick={fn()}>Save Changes</Button>
      </>
    ),
    width: 'lg',
  },
};

export const MediumWidth: Story = {
  args: {
    open: true,
    onClose: fn(),
    title: 'Quick Edit',
    children: (
      <div className="p-6">
        <p className="text-sm text-on-surface">A narrower drawer for quick edits.</p>
      </div>
    ),
    width: 'md',
  },
};

export const NoTitle: Story = {
  args: {
    open: true,
    onClose: fn(),
    children: (
      <div className="p-6">
        <p className="text-sm text-on-surface">Drawer without a title bar.</p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    open: false,
    onClose: fn(),
    title: 'Hidden Drawer',
    children: <div>Not visible</div>,
  },
};
