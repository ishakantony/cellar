import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button, allButtonVariants, allButtonSizes } from './button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [...allButtonVariants],
    },
    size: {
      control: 'select',
      options: [...allButtonSizes],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
    className: {
      table: {
        disable: true,
      },
    },
    onClick: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Examples: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      {/* All variants × all sizes */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-on-surface">All Variants × Sizes</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="font-medium text-xs text-on-surface-variant">Variant</div>
          <div className="font-medium text-xs text-on-surface-variant">Small</div>
          <div className="font-medium text-xs text-on-surface-variant">Medium</div>
          <div className="font-medium text-xs text-on-surface-variant">Large</div>
          {allButtonVariants.map((variant) => (
            <div key={variant} className="contents">
              <div className="flex items-center text-sm capitalize text-on-surface">
                {variant}
              </div>
              {allButtonSizes.map((size) => (
                <div key={`${variant}-${size}`} className="flex items-center">
                  <Button variant={variant} size={size}>
                    Button
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Disabled states */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-on-surface">Disabled States</h3>
        <div className="flex flex-wrap gap-3">
          {allButtonVariants.map((variant) => (
            <Button key={`${variant}-disabled`} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading states */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-on-surface">Loading States</h3>
        <div className="flex flex-wrap gap-3">
          {allButtonVariants.map((variant) => (
            <Button key={`${variant}-loading`} variant={variant} loading>
              {variant}
            </Button>
          ))}
        </div>
      </div>

      {/* Button combinations */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-on-surface">Button Combinations</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Save</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Help</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="danger">Delete</Button>
          <Button variant="outline">Archive</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {allButtonVariants.map((variant) => (
            <Button key={`${variant}-row`} variant={variant} size="sm">
              {variant}
            </Button>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Basic: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground. Use the controls panel to experiment with different prop combinations.',
      },
    },
  },
};
