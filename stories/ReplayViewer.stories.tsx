import * as React from "react";
import { Meta, Story } from "@storybook/react";
import { Playbar } from "../libs/ui/src";
import { FeatureReplayViewer, FeatureReplayViewerProps } from "../libs/feature-replay-viewer/src";

export default {
  component: FeatureReplayViewer,
  title: "Example/ReplayViewer",
} as Meta;

const Template: Story<FeatureReplayViewerProps> = (args) => <FeatureReplayViewer {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
