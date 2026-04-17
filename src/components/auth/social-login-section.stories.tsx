import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "@storybook/test";
import { SocialLoginSection } from "./social-login-section";

const meta = {
  title: "Auth/SocialLoginSection",
  component: SocialLoginSection,
  tags: ["autodocs"],
} satisfies Meta<typeof SocialLoginSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    onGitHubClick: async () => {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /continue with github/i }));
  },
};
