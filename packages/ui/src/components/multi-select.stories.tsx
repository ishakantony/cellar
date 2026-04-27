import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { MultiSelect } from './multi-select';

const meta: Meta<typeof MultiSelect> = {
  title: 'UI/MultiSelect',
  component: MultiSelect,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

const OPTIONS = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'rs', label: 'Rust' },
];

function InteractiveMultiSelect(
  props: Omit<React.ComponentProps<typeof MultiSelect>, 'selected' | 'onChange'>
) {
  const [selected, setSelected] = useState<string[]>([]);
  return <MultiSelect {...props} selected={selected} onChange={setSelected} />;
}

export const Empty: Story = {
  render: () => <InteractiveMultiSelect options={OPTIONS} placeholder="Select languages..." />,
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['js', 'ts']);
    return (
      <MultiSelect
        options={OPTIONS}
        selected={selected}
        onChange={setSelected}
        placeholder="Select languages..."
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    options: OPTIONS,
    selected: ['js'],
    disabled: true,
    onChange: fn(),
  },
};

export const Interaction: Story = {
  render: () => <InteractiveMultiSelect options={OPTIONS} placeholder="Select languages..." />,
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const input = canvas.querySelector('input');
    if (input) {
      input.focus();
      input.click();
    }
  },
};
