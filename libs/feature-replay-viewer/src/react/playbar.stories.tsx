import { Story, Meta } from "@storybook/react";
import { Playbar, PlaybarProps } from "./playbar";

export default {
  component: Playbar,
  title: "Playbar",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<PlaybarProps> = (args) => (
  <div className={"h-8"}>
    <Playbar {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  events: [
    { color: "#ff0000", position: 0.1 },
    { color: "green", position: 0.2 },
    { color: "cyan", position: 0.3 },
    { color: "#ffefab", position: 0.4 },
  ],
  loadedPercentage: 0.5,
};
