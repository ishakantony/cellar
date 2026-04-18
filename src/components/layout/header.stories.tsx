import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { Header } from './header';
import { SidebarToggle } from './sidebar-toggle';

const meta: Meta<typeof Header> = {
  component: Header,
  title: 'Layout/Header',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    sidebarToggle: <SidebarToggle onClick={fn()} collapsed={false} className="hidden md:flex" />,
    onAddCollection: fn(),
  },
};

export const WithSidebarToggle: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: true,
    sidebarToggle: <SidebarToggle onClick={fn()} collapsed={true} className="hidden md:flex" />,
    onAddCollection: fn(),
  },
};

export const Mobile: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    sidebarToggle: <SidebarToggle onClick={fn()} collapsed={false} className="hidden md:flex" />,
    onAddCollection: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const CollectionButtonClickable: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    sidebarToggle: <SidebarToggle onClick={fn()} collapsed={false} className="hidden md:flex" />,
    onAddCollection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const collectionButton = canvas.getByRole('button', { name: /collection/i });
    await userEvent.click(collectionButton);
    expect(args.onAddCollection).toHaveBeenCalled();
  },
};
