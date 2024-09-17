import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Click Me', variant: 'primary', shadow: true, size: "small"},
};

export const Secondary: Story = {
  args: { children: 'Click Me', variant: 'secondary' },
};

export const Disabled: Story = {
  args: { children: 'Click Me', shadow: true, disabled: true },
};
