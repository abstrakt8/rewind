import { Story, Meta } from "@storybook/react";
import { Toggle, ToggleProps } from "./Toggle";

export default {
  component: Toggle,
  title: "Toggle",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<ToggleProps> = (args) => <Toggle {...args} />;

export const Primary = Template.bind({});
