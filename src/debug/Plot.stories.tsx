import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentType } from 'react';
import { Select } from '../controls/Select.tsx';
import { Plot, type PlotProps } from './Plot.tsx';
import { inkOf } from './index.ts';
import { Frame } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

/** One drawing with a title bar, which is the graph the scope is not. */
type PlotArgs = Omit<PlotProps, 'draw' | 'actions' | 'caption'> & { caption: string; withActions: boolean };

function PlotCase({ title, caption, height, withActions: actions }: PlotArgs) {
  const [shape, setShape] = useState(0);
  const curve = (x: number) =>
    shape === 0 ? Math.exp(-Math.pow((x - 0.5) * 5, 2)) : shape === 1 ? x : Math.abs(Math.sin(x * 9));

  return (
    <Frame>
      <Plot
        title={title}
        height={height}
        actions={actions ? <Select label="Shape" items={['a peak', 'a ramp', 'a comb']} index={shape} onChange={setShape} width={110} /> : undefined}
        caption={caption || undefined}
        draw={(g, width, drawn, hover) => {
          g.strokeStyle = inkOf(g.canvas, 'fill');
          g.lineWidth = 1.5;
          g.beginPath();
          for (let x = 0; x <= width; x++) {
            const y = drawn - 8 - curve(x / width) * (drawn - 22);
            if (!x) g.moveTo(x, y); else g.lineTo(x, y);
          }
          g.stroke();
          if (hover === null) return;
          g.strokeStyle = inkOf(g.canvas, 'text');
          g.beginPath();
          g.moveTo(Math.round(hover) + 0.5, 0);
          g.lineTo(Math.round(hover) + 0.5, drawn);
          g.stroke();
        }}
      />
    </Frame>
  );
}

const meta = {
  title: 'Debug/Plot',
  // The draw is the story's own, so the args are the props without it.
  component: Plot as unknown as ComponentType<PlotArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "A titled canvas with a caption under it, drawn by callback. It is not on the scope's axis and has no time in it — a curve, a distribution, a sweep. The pointer's position is handed to the draw so a plot can say what is under it.",
      },
    },
  },
  args: { title: 'Tempo sweep', caption: 'Bottom of the curve at 120 bpm', height: 140, withActions: true },
  argTypes: {
    title: { control: 'text' },
    caption: { control: 'text', description: 'Empty leaves the caption out.' },
    height: { control: { type: 'range', min: 60, max: 320, step: 10 } },
    withActions: { control: 'boolean', description: 'Story-only: a select of what to plot, in the title bar.' },
    className: { control: false },
  },
  render: (args) => <PlotCase {...args} />,
} satisfies Meta<PlotArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Curve: Story = {
  name: 'Plot',
  parameters: note('A curve, with a select in the title bar choosing which. Move the pointer over it: the draw is handed its x and rules a line there.'),
};

export const Plain: Story = {
  parameters: note('Title and drawing only: no actions, no caption.'),
  args: { withActions: false, caption: '', height: 90 },
};
