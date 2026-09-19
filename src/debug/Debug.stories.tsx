import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';
import { Button } from '../controls/Button.tsx';
import { Select } from '../controls/Select.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import { Facts, type Fact } from './Facts.tsx';
import { Group, Harness, Shelf, Status, Toolbar } from './Harness.tsx';
import { Legend } from './Legend.tsx';
import { Plot } from './Plot.tsx';
import { Rooms } from './Rooms.tsx';
import { Scope, ScopeRow } from './Scope.tsx';
import { Transport } from './Transport.tsx';
import { inkOf, xOf, type View } from './index.ts';
import { useAxis } from './useAxis.ts';
import { Workspace } from './Workspace.tsx';
import { DebugCase } from '../../stories/DebugCase.tsx';

/**
 * One story a widget, so the seams are visible.
 *
 * The debug module was on the old bench as a single case of everything working
 * together, which shows that it does and hides what any of it is. A harness is
 * a frame; a scope is rows on a shared axis; a plot is one drawing with a title
 * on it. Those are different widgets with different jobs and they are worth
 * being able to look at one at a time — particularly by whoever is about to
 * reach for one and needs to know which.
 *
 * `Together` is still here, at the end, because the composition is the point of
 * the module and a page of parts would stop showing it.
 *
 * What each case is *for* is its description on the docs page; the canvas holds
 * the widget and nothing else. `Frame` is all that is left of the old card —
 * the column these widgets need in order to be full width.
 */

const wave = (i: number, seed: number) =>
  Math.sin(i / 7 + seed) * 0.55 + Math.sin(i / 2.3 + seed * 2) * 0.3;

/** The column a full-width debug widget wants. No card, no note. */
function Frame({ children }: { children: ReactNode }) {
  return <div className="case-stack">{children}</div>;
}

/** The frame, with nothing in it, so the frame is what you see. */
function HarnessCase({ title }: { title: string }) {
  const [on, setOn] = useState(true);
  return (
    <Frame>
      <Harness
        title={title}
        subject={<Select label="Subject" items={['a made-up signal', 'another']} index={0} onChange={() => {}} width={150} />}
        status={<Status tone="good">nothing wrong</Status>}
      >
        <Toolbar>
          <Group caption="Range">
            <Button onPress={() => {}}>Whole</Button>
            <Button onPress={() => {}}>+</Button>
            <Button onPress={() => {}}>−</Button>
          </Group>
          <Group caption="Show">
            <Toggle on={on} onChange={setOn} label="Show the beats">beats</Toggle>
          </Group>
          <Group caption="Verdict">
            <Status tone="bad">two missing</Status>
            <Status tone="quiet">and one for completeness</Status>
          </Group>
        </Toolbar>
        <Shelf>
          <Facts items={[{ name: 'what a shelf is for', value: 'anything under the toolbar' }]} />
        </Shelf>
      </Harness>
    </Frame>
  );
}

/** Rows that must line up to the pixel, and one zoom over all of them. */
function ScopeCase({ seconds }: { seconds: number }) {
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
      <Scope axis={axis}>
        <ScopeRow label="time" height={26} draw={ticks} ruler />
        <ScopeRow label="left" height={64} draw={line('cool', 1)} />
        <ScopeRow label="right" height={64} draw={line('good', 4)} />
      </Scope>
    </Frame>
  );
}

/** One drawing with a title bar, which is the graph the scope is not. */
function PlotCase({ title, caption, height }: { title: string; caption: string; height: number }) {
  const [shape, setShape] = useState(0);
  const curve = (x: number) =>
    shape === 0 ? Math.exp(-Math.pow((x - 0.5) * 5, 2)) : shape === 1 ? x : Math.abs(Math.sin(x * 9));

  return (
    <Frame>
      <Plot
        title={title}
        height={height}
        actions={<Select label="Shape" items={['a peak', 'a ramp', 'a comb']} index={shape} onChange={setShape} width={110} />}
        caption={caption}
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

/** The ledger a harness opens with. */
function FactsCase() {
  const items: Fact[] = [
    { name: 'tempo', value: '128.02 bpm' },
    { name: 'beats', value: 705 },
    { name: 'agreement', value: '93%', tone: 'good' },
    { name: 'missing', value: 2, tone: 'bad' },
    { name: 'latency', value: '11.6 ms', tone: 'quiet', title: 'What the output reported' },
    { name: 'arm', value: 'made up' },
  ];
  return (
    <Frame>
      <Facts items={items} />
      <Shelf>
        <Facts items={[{ name: 'in a shelf', value: 'the same widget, under a toolbar' }]} />
      </Shelf>
    </Frame>
  );
}

/** What the marks on a drawing mean. */
function LegendCase() {
  return (
    <Frame>
      <Legend
        items={[
          { kind: 'line', ink: 'var(--wdg-fill)', label: 'beat' },
          { kind: 'tall', ink: 'var(--green)', label: 'downbeat' },
          { kind: 'dashed', ink: 'var(--wdg-caption)', label: 'placed between anchors' },
          { kind: 'swatch', ink: 'var(--blue)', label: 'loop' },
          { kind: 'dot', ink: 'var(--wdg-alarm)', label: 'a fill' },
          { kind: 'text', ink: 'var(--green)', label: 'ms after predicted', text: '+1.2' },
        ]}
      />
    </Frame>
  );
}

/** Play, stop, and where the head is. */
function TransportCase({ latency, disabled }: { latency: number; disabled: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [at, setAt] = useState(12.3456);
  return (
    <Frame>
      <Transport
        playing={playing}
        onToggle={() => setPlaying((on) => !on)}
        at={at}
        latency={latency}
        disabled={disabled}
      >
        <Button onPress={() => setAt((n) => n + 1)}>+1s</Button>
        <Button onPress={() => setAt(0)}>Top</Button>
      </Transport>
    </Frame>
  );
}

/** The two the page you are reading is made of. */
function WorkspaceCase() {
  const [tab, setTab] = useState('one');
  const [room, setRoom] = useState('a');
  const [inner, setInner] = useState('x');
  const panel = (name: string) => () => <Facts items={[{ name: 'mounted', value: name }]} />;

  return (
    <Frame>
      <Workspace
        experiments={[
          { id: 'one', title: 'One', description: 'The description sits under the tabs.', component: panel('one') },
          { id: 'two', title: 'Two', description: 'Each tab brings its own.', component: panel('two') },
          { id: 'three', title: 'Three', description: '', component: panel('three') },
        ]}
        context={null}
        selected={tab}
        onSelect={setTab}
      />
      <Rooms
        rooms={[
          { id: 'a', title: 'First room', note: 'with a note under it', experiments: [
            { id: 'x', title: 'X', description: '', component: panel('a/x') },
            { id: 'y', title: 'Y', description: '', component: panel('a/y') },
          ] },
          { id: 'b', title: 'Second room', experiments: [
            { id: 'z', title: 'Z', description: '', component: panel('b/z') },
          ] },
        ]}
        context={null}
        room={room}
        tab={inner}
        onRoom={setRoom}
        onTab={setInner}
      />
    </Frame>
  );
}

const meta = {
  title: 'Debug/Harness',
  component: Harness,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The debug module one widget at a time, and then all of them together. Each part is a frame, a drawing or a ledger with no subject behind it, so what a harness is made of can be looked at before it is reached for.',
      },
    },
  },
  // Each story mounts its own case inside a harness, so the harness's slots
  // are not args here; the two stories that do take a title declare it
  // themselves.
  argTypes: {
    title: { control: false },
    subject: { control: false },
    status: { control: false },
    children: { control: false },
    className: { control: false },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Frame_: StoryObj<{ title: string }> = {
  name: 'Harness',
  args: { title: 'Harness' },
  argTypes: { title: { control: 'text' } },
  render: ({ title }) => <HarnessCase title={title} />,
  parameters: {
    docs: {
      description: {
        story:
          'The frame, with nothing in it, so the frame is what you see. A head with a title, a subject and a status; a toolbar of captioned groups; a shelf for anything that sits under them. It holds no state and draws nothing — everything else on this page is mounted inside one.',
      },
    },
  },
};

export const Scope_: StoryObj<{ seconds: number }> = {
  name: 'Scope',
  args: { seconds: 60 },
  argTypes: { seconds: { control: { type: 'range', min: 5, max: 300, step: 5 } } },
  render: ({ seconds }) => <ScopeCase seconds={seconds} />,
  parameters: {
    docs: {
      description: {
        story:
          'Rows that must line up to the pixel, and one zoom over all of them. Every row draws through a callback handed the same view, which is what makes them line up. The row marked as the ruler owns the time gestures: click to seek, drag to pan, shift-drag for a loop, alt-drag to scrub. Scroll pans, shift-scroll zooms about the pointer. Signal is what it holds; the scope knows nothing about either. Four thousand made-up samples, drawn straight from the view.',
      },
    },
  },
};

export const Plot_: StoryObj<{ title: string; caption: string; height: number }> = {
  name: 'Plot',
  args: { title: 'Tempo sweep', caption: 'Bottom of the curve at 120 bpm', height: 140 },
  argTypes: {
    title: { control: 'text' },
    caption: { control: 'text' },
    height: { control: { type: 'range', min: 60, max: 320, step: 10 } },
  },
  render: ({ title, caption, height }) => <PlotCase title={title} caption={caption} height={height} />,
  parameters: {
    docs: {
      description: {
        story:
          "One drawing with a title bar, which is the graph the scope is not. A plot is one drawing, titled, with room for controls beside the title and a caption under it. It is not on the scope's axis and has no time in it — a curve, a distribution, a sweep. The pointer's position is handed to the draw so a plot can say what is under it.",
      },
    },
  },
};

export const Facts_: Story = {
  name: 'Facts',
  render: () => <FactsCase />,
  parameters: {
    docs: {
      description: {
        story:
          'The ledger a harness opens with. Names and values, read at a glance — the summary a harness opens with. A tone marks the one worth noticing: good, bad, or quiet for the ones that exist only for completeness. It is a description list, so it reads in order to a screen reader as it does on the page.',
      },
    },
  },
};

export const Legend_: Story = {
  name: 'Legend',
  render: () => <LegendCase />,
  parameters: {
    docs: {
      description: {
        story:
          'What the marks on a drawing mean. Six kinds of mark, each in an ink the drawing also uses — usually a var(--…), so a legend follows the palette rather than restating it. It is the only widget here whose whole job is to be read beside something else.',
      },
    },
  },
};

export const Transport_: StoryObj<{ latency: number; disabled: boolean }> = {
  name: 'Transport',
  args: { latency: 0.0116, disabled: false },
  argTypes: {
    latency: { control: { type: 'range', min: 0, max: 0.2, step: 0.001 } },
    disabled: { control: 'boolean', description: 'As when nothing is loaded.' },
  },
  render: ({ latency, disabled }) => <TransportCase latency={latency} disabled={disabled} />,
  parameters: {
    docs: {
      description: {
        story:
          "Play, stop, and where the head is. A play button, the head as bars and as a clock, and the output's latency when the engine reports one. It owns no playback: it says what is true and calls back when pressed, which is what keeps it usable in a harness with no engine behind it. Disabled is what it looks like when nothing is loaded.",
      },
    },
  },
};

export const Workspace_: Story = {
  name: 'Workspace',
  render: () => <WorkspaceCase />,
  parameters: {
    docs: {
      description: {
        story:
          'The two the old bench page was made of: a workspace of tabs, and rooms of them. A workspace is a row of tabs over one panel. Only the selected experiment is mounted, so an experiment that runs something expensive stops when you leave it — and Reset tab remounts it, which is the quickest way to start a measurement over. Rooms are the second axis, for when one row of tabs stopped being a list: rooms down the side, that room’s tabs across the top. A room is a title and a set of experiments — no layout, no state — so regrouping is moving a line. A remembered tab from another room opens the room rather than emptying it.',
      },
    },
  },
};

export const Together: Story = {
  render: () => (
    <Frame>
      <DebugCase />
    </Frame>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Every debug widget at once, around a made-up signal with no app behind it. All of them at once, which is the point of the module and the thing a page of parts stops showing. A made-up signal, beats every half second, a head on the wall clock. Click the time row to seek, drag it to pan, shift-drag for a loop, alt-drag or drag the head to scrub; scroll pans and shift-scroll zooms about the pointer. Everything is drawn in palette inks read off the page, so it follows the host-tokens switch.',
      },
    },
  },
};
