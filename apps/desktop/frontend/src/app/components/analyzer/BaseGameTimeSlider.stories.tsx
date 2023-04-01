import { Box } from "@mui/material";
import { Meta, Story } from "@storybook/react";
import { BaseGameTimeSlider, BaseGameTimeSliderProps } from "./BaseGameTimeSlider";

export default {
  component: BaseGameTimeSlider,
  title: "BaseGameTimeSlider",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<BaseGameTimeSliderProps> = (args) => (
  <Box width={"420px"}>
    <BaseGameTimeSlider {...args} />
  </Box>
);

export const Primary = Template.bind({});
Primary.args = {
  backgroundEnable: true,
};

export const NotEnabled = Template.bind({});
NotEnabled.args = {
  backgroundEnable: false,
};
