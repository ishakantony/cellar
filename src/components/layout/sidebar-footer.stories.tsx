import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SidebarFooter } from './sidebar-footer';

const meta: Meta<typeof SidebarFooter> = {
  component: SidebarFooter,
  title: 'Layout/SidebarFooter',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof SidebarFooter>;

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://github.com/shadcn.png',
};

const mockUserNoImage = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  image: null,
};

export const Default: Story = {
  args: {
    activePath: '/dashboard',
    user: mockUser,
    onSignOut: fn(),
  },
};

export const SettingsActive: Story = {
  args: {
    activePath: '/settings',
    user: mockUser,
    onSignOut: fn(),
  },
};

export const NoAvatar: Story = {
  args: {
    activePath: '/dashboard',
    user: mockUserNoImage,
    onSignOut: fn(),
  },
};

export const InteractiveSignOut: Story = {
  args: {
    activePath: '/dashboard',
    user: mockUser,
    onSignOut: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const signOutButton = canvas.getByRole('button', { name: /sign out/i });
    await userEvent.click(signOutButton);
    expect(args.onSignOut).toHaveBeenCalled();
  },
};

export const ShowsBothElements: Story = {
  args: {
    activePath: '/settings',
    user: mockUser,
    onSignOut: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(canvas.getByText(mockUser.name)).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  },
};
