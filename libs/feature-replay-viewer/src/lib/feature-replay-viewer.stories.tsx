import "tailwindcss/tailwind.css";
import { Story, Meta } from "@storybook/react";
import { FeatureReplayViewer, FeatureReplayViewerProps } from "./feature-replay-viewer";

export default {
  component: FeatureReplayViewer,
  title: "FeatureReplayViewer",
} as Meta;

const Template: Story<FeatureReplayViewerProps> = (args) => <FeatureReplayViewer {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
