import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { UserMenu } from './user-menu';

const meta: Meta<typeof UserMenu> = {
  component: UserMenu,
  title: 'Layout/UserMenu',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

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
    user: mockUser,
    onSignOut: fn(),
  },
};

export const NoAvatar: Story = {
  args: {
    user: mockUserNoImage,
    onSignOut: fn(),
  },
};

export const LongName: Story = {
  args: {
    user: {
      name: 'Alexander Christopher Bartholomew',
      email: 'alex@example.com',
      image: 'https://github.com/shadcn.png',
    },
    onSignOut: fn(),
  },
};

export const InteractiveSignOut: Story = {
  args: {
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

export const WithNoAvatarInteraction: Story = {
  args: {
    user: mockUserNoImage,
    onSignOut: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const signOutButton = canvas.getByRole('button', { name: /sign out/i });
    await userEvent.click(signOutButton);
    expect(args.onSignOut).toHaveBeenCalled();
  },
};

export const DisplaysUserInfo: Story = {
  args: {
    user: mockUser,
    onSignOut: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(mockUser.name)).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  },
};
