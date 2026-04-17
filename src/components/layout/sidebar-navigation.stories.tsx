import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SidebarNavigation } from './sidebar-navigation';

const meta: Meta<typeof SidebarNavigation> = {
  component: SidebarNavigation,
  title: 'Layout/SidebarNavigation',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: {
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNavigation>;

export const Default: Story = {
  args: {
    activePath: '/dashboard',
  },
};

export const DashboardActive: Story = {
  args: {
    activePath: '/dashboard',
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
    activePath: '/assets',
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/assets',
      },
    },
  },
};

export const SnippetTypeActive: Story = {
  args: {
    activePath: '/assets',
    searchParams: {
      get: (key: string) => (key === 'type' ? 'SNIPPET' : null),
    } as { get: (key: string) => string | null },
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

export const CollectionsActive: Story = {
  args: {
    activePath: '/collections',
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/collections',
      },
    },
  },
};

export const ShowsBothSections: Story = {
  args: {
    activePath: '/dashboard',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('General')).toBeInTheDocument();
    expect(canvas.getByText('Assets')).toBeInTheDocument();
    expect(canvas.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(canvas.getByRole('link', { name: /snippets/i })).toBeInTheDocument();
  },
};
