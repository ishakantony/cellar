import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LogoIcon } from "./logo-icon";

const meta = {
  title: "Auth/LogoIcon",
  component: LogoIcon,
  tags: ["autodocs"],
} satisfies Meta<typeof LogoIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
