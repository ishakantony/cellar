import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Tabs } from './tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'UI/Tabs',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    value: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const defaultOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

export const Default: Story = {
  args: {
    value: 'all',
    options: defaultOptions,
    onChange: fn(),
  },
};

export const ActiveTab: Story = {
  args: {
    value: 'active',
    options: defaultOptions,
    onChange: fn(),
  },
};

export const WithNullValue: Story = {
  args: {
    value: null,
    options: [
      { value: null, label: 'All Items' },
      { value: 'recent', label: 'Recent' },
      { value: 'favorites', label: 'Favorites' },
    ],
    onChange: fn(),
  },
};

export const ManyTabs: Story = {
  args: {
    value: 'docs',
    options: [
      { value: 'all', label: 'All' },
      { value: 'docs', label: 'Documents' },
      { value: 'images', label: 'Images' },
      { value: 'links', label: 'Links' },
      { value: 'notes', label: 'Notes' },
    ],
    onChange: fn(),
  },
};
