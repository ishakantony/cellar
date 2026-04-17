import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Code,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Lightbulb,
  Folder,
} from 'lucide-react';
import { IconBadge } from './icon-badge';

const meta: Meta<typeof IconBadge> = {
  component: IconBadge,
  title: 'UI/IconBadge',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['snippet', 'prompt', 'note', 'link', 'image', 'file', 'collection'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    color: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof IconBadge>;

export const Snippet: Story = {
  args: {
    variant: 'snippet',
    icon: Code,
    size: 'md',
  },
};

export const Prompt: Story = {
  args: {
    variant: 'prompt',
    icon: Lightbulb,
    size: 'md',
  },
};

export const Note: Story = {
  args: {
    variant: 'note',
    icon: FileText,
    size: 'md',
  },
};

export const LinkVariant: Story = {
  args: {
    variant: 'link',
    icon: LinkIcon,
    size: 'md',
  },
};

export const ImageVariant: Story = {
  args: {
    variant: 'image',
    icon: ImageIcon,
    size: 'md',
  },
};

export const FileVariant: Story = {
  args: {
    variant: 'file',
    icon: FileText,
    size: 'md',
  },
};

export const Collection: Story = {
  args: {
    variant: 'collection',
    icon: Folder,
    color: 'bg-emerald-500/10 text-emerald-400',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    variant: 'snippet',
    icon: Code,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    variant: 'snippet',
    icon: Code,
    size: 'lg',
  },
};
