import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'UI/Select',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const defaultOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

export const Default: Story = {
  args: {
    value: 'option1',
    options: defaultOptions,
    onChange: fn(),
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: 'option1',
    options: defaultOptions,
    onChange: fn(),
    disabled: true,
  },
};

export const ManyOptions: Story = {
  args: {
    value: 'medium',
    options: [
      { value: 'xs', label: 'Extra Small' },
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
      { value: 'xl', label: 'Extra Large' },
      { value: 'xxl', label: 'Double XL' },
    ],
    onChange: fn(),
    disabled: false,
  },
};

export const StatusSelect: Story = {
  args: {
    value: 'active',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'archived', label: 'Archived' },
    ],
    onChange: fn(),
    disabled: false,
  },
};
