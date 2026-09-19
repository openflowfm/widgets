import { useState, type ReactNode } from 'react';
import { Chain, type ChainProps } from '../src/chrome/Chain.tsx';
import { Device } from '../src/chrome/Device.tsx';
import { Rack } from '../src/chrome/Rack.tsx';
import { Row } from '../src/chrome/Row.tsx';
import { Knob } from '../src/controls/Knob.tsx';
import { NumberField } from '../src/controls/NumberField.tsx';
import { Segmented } from '../src/controls/Segmented.tsx';
import { Slider } from '../src/controls/Slider.tsx';
import type { Param } from '../src/param/param.ts';
import { DRY_WET, FILTER, FREQ, GAIN, TIME } from './parts.tsx';

/**
 * The shells the chrome stories are built out of: a faceplate worth putting in
 * a shell, a shell, a run of them, a rack. Shared by the Device and Chain
 * stories, which show the same things at different scales.
 */

/**
 * A control holding its own value, so a story's faceplate is live.
 *
 * Stories that *are* a component's props take them as args; a faceplate inside
 * a shell is scenery, and scenery still has to work when you put a hand on it.
 */
export function Held({
  param,
  children,
}: {
  param: Param;
  children(value: number, set: (next: number) => void): ReactNode;
}) {
  const [value, setValue] = useState(param.defaultValue);
  return <>{children(value, setValue)}</>;
}

/** A faceplate worth putting in a shell: real controls, each with its own value. */
export function Faceplate() {
  return (
    <Row>
      <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} />}</Held>
      <Held param={DRY_WET}>{(v, set) => <Knob param={DRY_WET} value={v} onChange={set} />}</Held>
      <Held param={GAIN}>{(v, set) => <Slider param={GAIN} value={v} onChange={set} />}</Held>
    </Row>
  );
}

/** The same controls twice: left to themselves, then given a rhythm. */
export function Mixed({ ruled, gap }: { ruled?: boolean; gap?: number }) {
  const controls = (
    <>
      <Held param={FREQ}>{(v, set) => <Knob param={FREQ} value={v} onChange={set} />}</Held>
      <Held param={GAIN}>{(v, set) => <Slider param={GAIN} value={v} onChange={set} />}</Held>
      <Held param={TIME}>{(v, set) => <NumberField param={TIME} value={v} onChange={set} />}</Held>
      <Held param={FILTER}>
        {(v, set) => <Segmented items={FILTER.items ?? []} index={Math.round(v)} onChange={set} name="Filter" />}
      </Held>
    </>
  );
  return ruled ? (
    <Row gap={gap}>{controls}</Row>
  ) : (
    <div className="loose" style={gap === undefined ? undefined : { gap }}>
      {controls}
    </div>
  );
}

export function Shell({
  name = 'Auto Filter',
  active = true,
  collapsed = false,
  selected = false,
  swappable = false,
  onSelect,
}: {
  name?: string;
  active?: boolean;
  collapsed?: boolean;
  selected?: boolean;
  swappable?: boolean;
  onSelect?(): void;
}) {
  const [on, setOn] = useState(active);
  const [folded, setFolded] = useState(collapsed);
  return (
    <Device
      name={name}
      on={on}
      onToggle={setOn}
      folded={folded}
      onFold={setFolded}
      selected={selected}
      onSelect={onSelect ?? (() => {})}
      onHotSwap={swappable ? () => {} : undefined}
    >
      <Faceplate />
    </Device>
  );
}

/** Three of them, because a chain is the thing we're actually building. */
export function Run(props: ChainProps) {
  const [at, setAt] = useState(1);
  const names = ['EQ Eight', 'Auto Filter', 'Saturator'];
  return (
    <Chain {...props}>
      {names.map((name, i) => (
        <Shell
          key={name}
          name={name}
          collapsed={i === 0}
          selected={i === at}
          swappable={i === 1}
          onSelect={() => setAt(i)}
        />
      ))}
    </Chain>
  );
}

const MACROS = ['Macro 1', 'Macro 2', 'Macro 3', 'Macro 4'];

/** A rack in a chain, holding chains of its own. The recursion is the point. */
export function Grouped(props: ChainProps) {
  const [at, setAt] = useState(1);
  const [on, setOn] = useState(true);
  const [folded, setFolded] = useState(false);
  const [device, setDevice] = useState(0);

  return (
    <Chain {...props}>
      <Shell name="EQ Eight" collapsed />
      <Rack
        name="Audio Effect Rack"
        on={on}
        onToggle={setOn}
        folded={folded}
        onFold={setFolded}
        selected
        onSelect={() => {}}
        chains={['Dry', 'Delay', 'Reverb']}
        chainAt={at}
        onChain={setAt}
        macros={MACROS.map((name) => (
          <Held key={name} param={DRY_WET}>
            {(v, set) => <Knob param={DRY_WET} value={v} onChange={set} name={name} />}
          </Held>
        ))}
      >
        <Chain placeholder="Drop an audio effect here">
          {at === 0
            ? []
            : ['Delay', 'Reverb']
                .slice(at - 1, at)
                .map((name) => (
                  <Shell key={name} name={name} selected={device === 0} onSelect={() => setDevice(0)} />
                ))}
        </Chain>
      </Rack>
      <Shell name="Saturator" />
    </Chain>
  );
}
