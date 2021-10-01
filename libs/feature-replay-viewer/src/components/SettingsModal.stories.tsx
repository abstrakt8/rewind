import { Meta, Story } from "@storybook/react";
import { SettingsModal, SettingsProps } from "./SettingsModal";
import { Paper } from "@mui/material";

export default {
  component: SettingsModal,
  title: "SettingsModal",
  argTypes: {
    onClick: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<SettingsProps> = (args) => (
  <Paper elevation={2} sx={{ width: 560 }}>
    <SettingsModal {...args} />
  </Paper>
);

export const Primary = Template.bind({});
Primary.args = {};
