import { Meta, Story } from "@storybook/react";
import { HelpBox } from "./HelpModal";

export default {
  component: HelpBox,
  title: "HelpModal",
  argTypes: {
    onClose: { action: "onClose executed!" },
  },
} as Meta;

const Template: Story<void> = (args) => <HelpBox onClose={() => {}} />;

export const Primary = Template.bind({});
