import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { Playbar, PlaybarProps } from '../libs/ui/src';


export default {
  component: Playbar,
  title: 'Example/Playbar'
} as Meta;

const Template: Story<PlaybarProps> = (args) => <Playbar {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
