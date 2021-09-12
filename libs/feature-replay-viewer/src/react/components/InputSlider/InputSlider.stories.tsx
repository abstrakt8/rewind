import { Meta, Story } from "@storybook/react";
import { InputSlider, InputSliderProps } from "./InputSlider";
import { useState } from "react";

export default {
  component: InputSlider,
  title: "InputSlider",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<InputSliderProps> = (args) => {
  const [value, setValue] = useState(args.value);
  return (
    <div className={"flex items-center h-16 w-full"}>
      <InputSlider {...args} value={value} onValueChange={(x) => setValue(x)} />
    </div>
  );
};

export const Primary = Template.bind({});
Primary.args = {
  value: 30,
  min: 0,
  max: 100,
  step: 1,
};

export const Full = Template.bind({});
Full.args = {
  value: 100,
  min: 0,
  max: 100,
  step: 1,
};
