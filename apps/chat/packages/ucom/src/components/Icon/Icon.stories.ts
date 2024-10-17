import type { Meta, StoryObj } from '@storybook/react';
import * as Icons from '../../icons';
import Icon from './Icon';

const iconsList: Array<String> = [];
Object.entries(Icons).filter(([name]) => name !== "iconList").map(([name]) => iconsList.push(name))

const meta = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  parameters: { 
    layout: 'centered',
    source: {
      code: "import", // ADD SOURCE CODE
    }, 
  },
  argTypes: {
    icon: {
      options: iconsList,
      control: { type: 'select' },
    },
  }
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { icon: 'Chat', fontSize: "4rem", color: "#000000" },
};


