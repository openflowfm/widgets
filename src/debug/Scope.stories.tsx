import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import { Scope, ScopeRow, type ScopeProps } from './Scope.tsx';
import { inkOf, xOf, type View } from './index.ts';
import { useAxis } from './useAxis.ts';
import { Frame, wave } from '../../stories/debug.tsx';
import { note } from '../../stories/parts.tsx';

/** Rows that must line up to the pixel, and one zoom over all of them. */
type ScopeArgs = Omit<ScopeProps, 'axis' | 'head'> & { seconds: number; rows: number; withHead: boolean };

function ScopeCase({ seconds, labels, rows, withHead: head }: ScopeArgs) {
  const axis = useAxis({ seconds, initial: { from: 0, to: Math.min(20, seconds) } });

  const line = (ink: 'cool' | 'good', seed: number) => (g: CanvasRenderingContext2D, view: View) => {
    g.strokeStyle = inkOf(g.canvas, ink as 'cool');
    g.lineWidth = 1;
    g.beginPath();
    for (let x = 0; x <= view.width; x++) {
      const at = view.from + ((view.to - view.from) * x) / view.width;
      const y = view.height / 2 - wave(at * 6 + seed, seed) * view.height * 0.4;
      if (!x) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.stroke();
  };

  const ticks = (g: CanvasRenderingContext2D, view: View) => {
    g.strokeStyle = inkOf(g.canvas, 'edge');
    g.beginPath();
    for (let beat = Math.floor(view.from * 2); beat <= view.to * 2; beat++) {
      const x = Math.round(xOf(view, beat / 2)) + 0.5;
      g.moveTo(x, view.height * 0.2);
      g.lineTo(x, view.height * 0.8);
    }
    g.stroke();
  };

  return (
    <Frame>
      <Scope axis={axis} labels={labels} head={head ? axis.cursor + 1.5 : undefined}>
        <ScopeRow label="time" height={26} draw={ticks} ruler />
        {Array.from({ length: rows }, (_, i) => (
          <ScopeRow key={i} label={['left', 'right', 'sum', 'side'][i % 4]} height={64} draw={line(i % 2 ? 'good' : 'cool', i + 1)} />
        ))}
      </Scope>
    </Frame>
  );
}

const meta = {
  title: 'Debug/Scope',
  // The axis is a hook's, so the args are the props without it.
  component: Scope as unknown as ComponentType<ScopeArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Labelled rows of canvases on one time axis, with the head, the loop and the pointer drawn over all of them. Every row draws through a callback handed the same view, which is what makes them line up. The row marked as the ruler owns the time gestures: click to seek, drag to pan, shift-drag for a loop, alt-drag to scrub. Scroll pans, shift-scroll zooms about the pointer. Signal is what it holds; the scope knows nothing about either.',
      },
    },
  },
  args: { seconds: 60, labels: 72, rows: 2, withHead: false },
  argTypes: {
    seconds: { control: { type: 'range', min: 5, max: 300, step: 5 }, description: 'Story-only: the length of the made-up signal the axis spans.' },
    labels: { control: { type: 'range', min: 40, max: 160, step: 4 } },
    rows: { control: { type: 'range', min: 1, max: 4, step: 1 }, description: 'Story-only: how many signal rows sit under the ruler.' },
    withHead: { control: 'boolean', description: 'Story-only: hand in a head a beat and a half past the cursor, as when something plays.' },
    scrub: { control: false },
    overlay: { control: false },
    children: { control: false },
    className: { control: false },
  },
  render: (args) => <ScopeCase {...args} />,
} satisfies Meta<ScopeArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rows: Story = {
  name: 'Scope',
  parameters: note('A ruler of half-second ticks and two rows of a made-up wave, drawn straight from the view. Drag the ruler to pan; shift-drag it for a loop.'),
};

export const Playing: Story = {
  parameters: note('The head as it is while something plays: handed in, ahead of the cursor, drawn over every row.'),
  args: { withHead: true, rows: 3 },
};
