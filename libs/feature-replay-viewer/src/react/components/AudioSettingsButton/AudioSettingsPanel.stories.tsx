import { Meta, Story } from "@storybook/react";
import { AudioSettingsPanel, AudioSettingsPanelProps } from "./AudioSettingsPanel";

export default {
  component: AudioSettingsPanel,
  title: "AudioSettingsPanel",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<AudioSettingsPanelProps> = (args) => (
  <div className={"h-8"}>
    <AudioSettingsPanel {...args} />
  </div>
);

export const Primary = Template.bind({});
Primary.args = {
  musicVolume: 30,
  effectVolume: 50,
  masterVolume: 80,
};
