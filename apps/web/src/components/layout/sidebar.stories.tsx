import type { Meta, StoryObj } from '@storybook/react-vite';
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
    user: mockUser,
  },
};

export const Collapsed: Story = {
  args: {
    collapsed: true,
    user: mockUser,
  },
};

export const AssetsActive: Story = {
  args: {
    collapsed: false,
    user: mockUser,
  },
};

export const Mobile: Story = {
  args: {
    collapsed: false,
    user: mockUser,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
