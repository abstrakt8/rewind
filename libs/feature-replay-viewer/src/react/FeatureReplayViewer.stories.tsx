import "tailwindcss/tailwind.css";
import { Story, Meta } from "@storybook/react";
import { GameStage, FeatureReplayViewerProps } from "./GameStage";

export default {
  component: GameStage,
  title: "FeatureReplayViewer",
} as Meta;

const Template: Story<FeatureReplayViewerProps> = (args) => <GameStage {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
