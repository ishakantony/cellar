import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Home, Settings, User, Bell, FileText } from 'lucide-react';
import { NavSection } from './nav-section';

const meta: Meta<typeof NavSection> = {
  component: NavSection,
  title: 'Layout/NavSection',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof NavSection>;

const defaultItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export const Default: Story = {
  args: {
    title: 'General',
    items: defaultItems,
    activePath: '/dashboard',
  },
};

export const WithActiveItem: Story = {
  args: {
    title: 'General',
    items: defaultItems,
    activePath: '/settings',
  },
};

export const MultipleSections: Story = {
  render: () => (
    <div className="space-y-4">
      <NavSection
        title="Navigation"
        items={[
          { href: '/dashboard', icon: Home, label: 'Dashboard' },
          { href: '/notifications', icon: Bell, label: 'Notifications' },
        ]}
        activePath="/dashboard"
      />
      <NavSection
        title="Content"
        items={[
          { href: '/documents', icon: FileText, label: 'Documents' },
          { href: '/settings', icon: Settings, label: 'Settings' },
        ]}
        activePath="/dashboard"
      />
    </div>
  ),
};

export const WithAssetTypeItems: Story = {
  args: {
    title: 'Assets',
    items: [
      { href: '/assets?type=DOCUMENT', icon: FileText, label: 'Documents', type: 'DOCUMENT' },
      { href: '/assets?type=IMAGE', icon: User, label: 'Images', type: 'IMAGE' },
    ],
    activePath: '/assets',
    searchParams: {
      get: (key: string) => (key === 'type' ? 'DOCUMENT' : null),
    } as { get: (key: string) => string | null },
  },
};

export const WithSectionTitle: Story = {
  args: {
    title: 'User Management',
    items: [
      { href: '/users', icon: User, label: 'All Users' },
      { href: '/users/settings', icon: Settings, label: 'User Settings' },
    ],
    activePath: '/users',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sectionTitle = canvas.getByText('User Management');
    expect(sectionTitle).toBeInTheDocument();
  },
};
