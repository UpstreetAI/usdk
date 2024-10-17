import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';
import * as Icons from '../../icons';

const iconsList: Array<String> = [];
Object.entries(Icons).filter(([name]) => name !== "iconList").map(([name]) => iconsList.push(name))

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    icon: {
      options: iconsList,
      control: { type: 'select' },
    },
  }
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { icon: "Chat", variant: 'primary', shadow: true, size: "small", active: false, disabled: false},
};

export const Secondary: Story = {
  args: { icon: "Chat", variant: 'secondary', shadow: false, size: "small", active: false, disabled: false},
};

export const Disabled: Story = {
  args: { icon: "Chat", variant: 'primary', shadow: true, size: "small", active: false, disabled: true},
};
