import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { MobileMenuToggle } from './mobile-menu-toggle';

const meta: Meta<typeof MobileMenuToggle> = {
  component: MobileMenuToggle,
  title: 'Layout/MobileMenuToggle',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MobileMenuToggle>;

export const Default: Story = {
  args: {
    onClick: fn(),
  },
};

export const WithCustomClass: Story = {
  args: {
    onClick: fn(),
    className: 'text-primary',
  },
};

export const Clickable: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /open menu/i });
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};
