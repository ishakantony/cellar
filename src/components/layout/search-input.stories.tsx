import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn, userEvent, within, expect } from 'storybook/test';
import { SearchInput } from './search-input';

const meta: Meta<typeof SearchInput> = {
  component: SearchInput,
  title: 'Layout/SearchInput',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SearchInput>;

export const Empty: Story = {
  args: {
    value: '',
    onChange: fn(),
    onSubmit: fn(),
    placeholder: 'Quick search...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'search query',
    onChange: fn(),
    onSubmit: fn(),
    placeholder: 'Quick search...',
  },
};

export const Disabled: Story = {
  args: {
    value: '',
    onChange: fn(),
    onSubmit: fn(),
    placeholder: 'Quick search...',
    disabled: true,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onChange: fn(),
    onSubmit: fn(),
    placeholder: 'Search items...',
  },
};

export const SubmitsOnEnter: Story = {
  args: {
    value: 'test query',
    onChange: fn(),
    onSubmit: fn(),
    placeholder: 'Quick search...',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    await userEvent.type(input, '{enter}');
    expect(args.onSubmit).toHaveBeenCalledWith('test query');
  },
};
