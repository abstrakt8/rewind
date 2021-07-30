import { Story, Meta } from "@storybook/react";
import { Playbar, PlaybarProps } from "./playbar";

export default {
  component: Playbar,
  title: "Playbar",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<PlaybarProps> = (args) => <Playbar {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
