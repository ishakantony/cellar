import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SidebarToggle } from './sidebar-toggle';

const meta: Meta<typeof SidebarToggle> = {
  component: SidebarToggle,
  title: 'Layout/SidebarToggle',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    collapsed: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarToggle>;

export const Expanded: Story = {
  args: {
    onClick: fn(),
    collapsed: false,
  },
};

export const Collapsed: Story = {
  args: {
    onClick: fn(),
    collapsed: true,
  },
};

export const InteractiveExpanded: Story = {
  args: {
    onClick: fn(),
    collapsed: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /collapse sidebar/i });
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const InteractiveCollapsed: Story = {
  args: {
    onClick: fn(),
    collapsed: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /expand sidebar/i });
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const ToggleSequence: Story = {
  args: {
    onClick: fn(),
    collapsed: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // First click
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(1);

    // Second click
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
