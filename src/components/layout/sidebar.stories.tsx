import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Sidebar } from './sidebar';

const meta: Meta<typeof Sidebar> = {
  component: Sidebar,
  title: 'Layout/Sidebar',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  image: 'https://github.com/shadcn.png',
};

export const Default: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
};

export const AssetsActive: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/assets',
        query: { type: 'SNIPPET' },
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    collapsed: false,
    onToggle: fn(),
    user: mockUser,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
