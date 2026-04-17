import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { Home, Settings, User, Bell } from 'lucide-react';
import { NavItem } from './nav-item';

const meta: Meta<typeof NavItem> = {
  component: NavItem,
  title: 'Layout/NavItem',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    active: { control: 'boolean' },
    href: { control: 'text' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    href: '/dashboard',
    icon: Home,
    label: 'Dashboard',
    active: false,
  },
};

export const Active: Story = {
  args: {
    href: '/settings',
    icon: Settings,
    label: 'Settings',
    active: true,
  },
};

export const WithIcon: Story = {
  args: {
    href: '/profile',
    icon: User,
    label: 'Profile',
    active: false,
  },
};

export const WithDifferentIcon: Story = {
  args: {
    href: '/notifications',
    icon: Bell,
    label: 'Notifications',
    active: false,
  },
};
