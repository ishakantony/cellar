import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  component: SearchInput,
  title: 'UI/SearchInput',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Search collections...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Design',
    onChange: fn(),
    placeholder: 'Search collections...',
  },
};

export const Cleared: Story = {
  args: {
    value: '',
    onChange: fn(),
    placeholder: 'Search collections...',
  },
};
