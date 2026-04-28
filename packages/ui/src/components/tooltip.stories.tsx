import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings, Trash2 } from 'lucide-react';
import { Tooltip } from './tooltip';
import { Button } from './button';
import { IconButton } from './icon-button';

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: 'UI/Tooltip',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Portal-based tooltip that appears above its trigger on hover. Renders into document.body so it escapes any overflow:hidden ancestor.',
      },
    },
  },
  argTypes: {
    content: { control: 'text' },
    placement: { control: 'select', options: ['start', 'center', 'end'] },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
  },
  render: args => (
    <div className="p-16">
      <Tooltip {...args}>
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  ),
};

export const WithIconButton: Story = {
  args: {
    content: 'Delete item',
  },
  render: args => (
    <div className="p-16">
      <Tooltip {...args}>
        <IconButton icon={Trash2} size="md" label="Delete" variant="danger" />
      </Tooltip>
    </div>
  ),
};

export const WithSettings: Story = {
  args: {
    content: 'Open settings',
  },
  render: args => (
    <div className="p-16">
      <Tooltip {...args}>
        <IconButton icon={Settings} size="md" label="Settings" />
      </Tooltip>
    </div>
  ),
};

export const PlacementStart: Story = {
  args: {
    content: 'Apr 28, 2026, 10:30:00 AM GMT+7',
    placement: 'start',
  },
  render: args => (
    <div className="p-16">
      <Tooltip {...args}>
        <span className="text-xs text-outline cursor-default">Created 2 minutes ago</span>
      </Tooltip>
    </div>
  ),
};

export const PlacementEnd: Story = {
  args: {
    content: 'Apr 28, 2026, 10:30:00 AM GMT+7',
    placement: 'end',
  },
  render: args => (
    <div className="p-16">
      <Tooltip {...args}>
        <span className="text-xs text-outline cursor-default">Updated 2 minutes ago</span>
      </Tooltip>
    </div>
  ),
};

export const OverflowEscape: Story = {
  render: () => (
    <div className="p-16">
      <div className="overflow-hidden w-48 h-16 border border-white/10 rounded flex items-center justify-center">
        <Tooltip content="Escaped the overflow container">
          <Button size="sm">Hover me</Button>
        </Tooltip>
      </div>
    </div>
  ),
};

export const MultipleTooltips: Story = {
  render: () => (
    <div className="p-16 flex items-center gap-4">
      <Tooltip content="Pin asset">
        <Button variant="ghost" size="sm">
          Pin
        </Button>
      </Tooltip>
      <Tooltip content="Edit asset">
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </Tooltip>
      <Tooltip content="Delete asset">
        <Button variant="ghost" size="sm">
          Delete
        </Button>
      </Tooltip>
    </div>
  ),
};
