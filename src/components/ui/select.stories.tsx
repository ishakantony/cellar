import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
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
  render: () => {
    const [value, setValue] = useState('option1');
    return <Select value={value} options={defaultOptions} onChange={setValue} />;
  },
};

export const Disabled: Story = {
  args: {
    value: 'option1',
    options: defaultOptions,
    onChange: () => {},
    disabled: true,
  },
};

export const ManyOptions: Story = {
  render: () => {
    const [value, setValue] = useState('medium');
    return (
      <Select
        value={value}
        options={[
          { value: 'xs', label: 'Extra Small' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
          { value: 'xxl', label: 'Double XL' },
        ]}
        onChange={setValue}
      />
    );
  },
};

export const StatusSelect: Story = {
  render: () => {
    const [value, setValue] = useState('active');
    return (
      <Select
        value={value}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
          { value: 'archived', label: 'Archived' },
        ]}
        onChange={setValue}
      />
    );
  },
};
