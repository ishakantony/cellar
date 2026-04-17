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
    onAddItem: fn(),
    onAddCollection: fn(),
  },
};

export const WithSidebarToggle: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: true,
    sidebarToggle: <SidebarToggle onClick={fn()} />,
    onAddItem: fn(),
    onAddCollection: fn(),
  },
};

export const SearchActive: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
    onAddCollection: fn(),
    searchPlaceholder: 'Search items...',
  },
};

export const Mobile: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
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
    onAddItem: fn(),
    onAddCollection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Collection button - index depends on viewport but should be second or third
    const collectionButton =
      buttons.find(btn => btn.textContent?.includes('Collection')) || buttons[1];
    await userEvent.click(collectionButton);
    expect(args.onAddCollection).toHaveBeenCalled();
  },
};

export const AddItemButtonClickable: Story = {
  args: {
    onMobileMenuToggle: fn(),
    sidebarCollapsed: false,
    onAddItem: fn(),
    onAddCollection: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    // Add Item button - index depends on viewport
    const addItemButton = buttons.find(btn => btn.textContent?.includes('Add Item')) || buttons[2];
    await userEvent.click(addItemButton);
    expect(args.onAddItem).toHaveBeenCalled();
  },
};
