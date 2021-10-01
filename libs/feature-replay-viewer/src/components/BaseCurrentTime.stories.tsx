import { Meta, Story } from "@storybook/react";
import { Paper } from "@mui/material";
import { BaseCurrentTime, GameCurrentTimeProps } from "./BaseCurrentTime";

export default {
  component: BaseCurrentTime,
  title: "BaseCurrentTime",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<GameCurrentTimeProps> = (args) => (
  <Paper elevation={1}>
    <BaseCurrentTime {...args} />
  </Paper>
);

export const Time200ms = Template.bind({});
Time200ms.args = {
  currentTimeInMs: 200,
};

export const Time1727ms = Template.bind({});
Time1727ms.args = {
  currentTimeInMs: 1727,
};

export const TimeHour = Template.bind({});
TimeHour.args = {
  currentTimeInMs: 60 * 60 * 1000 + 727,
};
