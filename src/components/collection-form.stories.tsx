import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { CollectionForm } from './collection-form';

const meta: Meta<typeof CollectionForm> = {
  component: CollectionForm,
  title: 'CollectionForm',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CollectionForm>;

export const Empty: Story = {
  args: {
    onSubmit: fn(async () => {}),
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
};

export const Filled: Story = {
  args: {
    onSubmit: fn(async () => {}),
    defaultValues: {
      name: 'My Collection',
      description: 'A collection of items',
      color: '#a855f7',
    },
    submitLabel: 'Save',
    mode: 'edit',
    onCancel: fn(),
  },
};

export const WithErrors: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('A collection with this name already exists');
    }),
    defaultValues: {
      name: 'Existing Collection',
    },
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
};
