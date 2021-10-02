import { Meta, Story } from "@storybook/react";
import { BaseSettingsModal, SettingsProps } from "./BaseSettingsModal";
import { Paper } from "@mui/material";

export default {
  component: BaseSettingsModal,
  title: "BaseSettingsModal",
  argTypes: {
    onClose: { action: "onClick executed!" },
  },
} as Meta;

const Template: Story<SettingsProps> = (args) => (
  <Paper elevation={2} sx={{ width: 560 }}>
    <BaseSettingsModal {...args} />
  </Paper>
);

export const Primary = Template.bind({});
Primary.args = {
  tabs: [
    { component: <div>General</div>, label: "General" },
    { component: <div>Skinning</div>, label: "Cool" },
  ],
};
