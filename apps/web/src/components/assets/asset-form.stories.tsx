import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AssetForm } from './asset-form';

const meta: Meta<typeof AssetForm> = {
  title: 'Assets/AssetForm',
  component: AssetForm,
  tags: ['autodocs'],
  args: {
    availableCollections: [
      { id: 'c1', name: 'Work' },
      { id: 'c2', name: 'Personal' },
    ],
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof AssetForm>;

export const CreateSnippet: Story = {
  args: {
    mode: 'create',
    defaultValues: { type: 'SNIPPET' },
  },
};

export const CreateNote: Story = {
  args: {
    mode: 'create',
    defaultValues: { type: 'NOTE' },
  },
};

export const CreateLink: Story = {
  args: {
    mode: 'create',
    defaultValues: { type: 'LINK' },
  },
};

export const CreateImage: Story = {
  args: {
    mode: 'create',
    defaultValues: { type: 'IMAGE' },
  },
};

export const EditSnippet: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      type: 'SNIPPET',
      title: 'Auth Helper',
      description: 'JWT auth helper',
      content: 'function auth() {}',
      language: 'typescript',
      collectionIds: ['c1'],
    },
  },
};
