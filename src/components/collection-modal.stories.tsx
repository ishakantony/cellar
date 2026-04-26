import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import { CollectionModal } from './collection-modal';
import { Button } from '@/components/ui/button';
import type { CreateCollectionInput } from '@/lib/validation';

function CollectionModalDemo() {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: CreateCollectionInput) => {
    console.log('Collection data:', data);
    return Promise.resolve();
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Collection</Button>
      <CollectionModal open={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} />
    </div>
  );
}

const meta: Meta<typeof CollectionModalDemo> = {
  component: CollectionModalDemo,
  title: 'Collections/CollectionModal',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CollectionModalDemo>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the modal by clicking the trigger button
    await userEvent.click(canvas.getByRole('button', { name: /add collection/i }));

    // Modal should be open with the dialog visible
    const dialog = canvas.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Fill in the form fields
    await userEvent.type(canvas.getByLabelText('Name'), 'My Collection');
    await userEvent.type(canvas.getByLabelText('Description'), 'A description for the collection');

    // Submit the form
    await userEvent.click(canvas.getByRole('button', { name: /create/i }));

    // Modal should close after successful submit
    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const CancelClosesModal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the modal
    await userEvent.click(canvas.getByRole('button', { name: /add collection/i }));

    // Modal should be open
    expect(canvas.getByRole('dialog')).toBeInTheDocument();

    // Click cancel button
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }));

    // Modal should close
    expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
