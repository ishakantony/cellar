import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, userEvent, within } from 'storybook/test';
import { CollectionForm } from './collection-form';

const meta: Meta<typeof CollectionForm> = {
  component: CollectionForm,
  title: 'Collections/CollectionForm',
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
      color: '#3b82f6',
    },
    submitLabel: 'Save',
    mode: 'edit',
    onCancel: fn(),
  },
};

export const Loading: Story = {
  args: {
    onSubmit: fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }),
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'New Collection');
    await userEvent.type(canvas.getByLabelText('Description'), 'A description for the collection');
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));
  },
};

export const WithValidationError: Story = {
  args: {
    onSubmit: fn(async () => {}),
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Submit without filling required name field
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));
  },
};

export const WithServerError: Story = {
  args: {
    onSubmit: fn(async () => {
      throw new Error('A collection with this name already exists');
    }),
    submitLabel: 'Create',
    mode: 'create',
    onCancel: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'Existing Collection');
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));
  },
};
