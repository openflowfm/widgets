import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Chain } from './Chain.tsx';
import { Device, DeviceMore, DevicePortRow } from './Device.tsx';
import { Graph, GraphNode, type GraphCord } from './Graph.tsx';
import { GraphContext } from './graphContext.ts';
import { Port } from './Port.tsx';
import { Row } from './Row.tsx';
import { Sheet, SheetRow, SheetSection, type SheetPlace } from './Sheet.tsx';
import { Button } from '../controls/Button.tsx';
import { Knob } from '../controls/Knob.tsx';
import { Label } from '../controls/Label.tsx';
import { NumberField } from '../controls/NumberField.tsx';
import { Select } from '../controls/Select.tsx';
import { Slider } from '../controls/Slider.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import type { Param } from '../param/param.ts';
import {
  CROWD,
  FRACTAL,
  KINDS,
  PALETTE,
  RIPPLE,
  SIGNAL,
  port,
  type FlowNode,
  type Inlet,
  type Outlet,
  type Scene,
  type Signal,
} from '../../stories/flow.ts';
import { Picture } from '../../stories/pictures.tsx';

/**
 * What a node's face should be once the node has ten parameters.
 *
 * The first host of the graph draws a node as one row per inlet under a
 * picture, which was the right first face and stops being one at ten rows:
 * a `fractal` is a form, `secondary` truncates at the width every face
 * shares, a driven number looks like one you can drag, and a `colorway`'s
 * five outlets sit on the rows of three inlets that have nothing to do with
 * them. These stories are the same flow drawn four ways, so the question can
 * be settled with a hand on it rather than an argument.
 *
 * **Today** is the face as it is now, for the comparison. **A** empties the
 * face into a panel pinned beside the canvas. **B** keeps everything on the
 * face and opens it in place. **C** puts the selected node's whole path in a
 * device strip under the canvas, the way a track's chain sits under Live's
 * arrangement. **Recommended** is what the three argued for: a face that
 * shows what matters — the mode's own controls and anything wired or turned
 * — with the rest counted on one line, and a sheet hung beside the node when
 * it is selected, at screen scale, holding every row with room to read it.
 *
 * The vocabulary is a real host's, in [`flow.ts`](../../stories/flow.ts);
 * nothing of that host is imported. Numbers are 0–100 the way its controls
 * are; a driven row reads `value + reach × signal`, clamped, which is what
 * its cords do; nothing here proposes a semantic the host does not have.
 */

const VALUE: Param = {
  kind: 'float',
  min: 0,
  max: 100,
  defaultValue: 50,
  unit: 'percent',
  shortName: 'Value',
};

/** How far a cord carries a number, signed. The sign is the polarity. */
const REACH: Param = {
  kind: 'float',
  min: -100,
  max: 100,
  defaultValue: 100,
  unit: 'percent',
  shortName: 'Reach',
};

/**
 * One source for every driven row, at a display's rate rather than a
 * renderer's: ten readings a second is what a host hands a control.
 */
function useSignal(): (id: string, mode?: string) => number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((was) => was + 1), 100);
    return () => window.clearInterval(timer);
  }, []);
  return useCallback(
    (id: string, mode?: string) => {
      let seed = 0;
      for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) % 997;
      const phase = ((tick * 0.03 + seed / 997) % 1) * Math.PI * 2;
      if (mode === 'square') return Math.sin(phase) >= 0 ? 1 : 0;
      if (mode === 'triangle') return Math.abs(((phase / Math.PI) % 2) - 1);
      return Math.sin(phase) * 0.5 + 0.5;
    },
    [tick],
  );
}

/** The two halves of a port address, split on the last slash. */
const split = (id: string) => {
  const cut = id.lastIndexOf('/');
  return { node: id.slice(0, cut), name: id.slice(cut + 1) };
};

const faceName = (node: FlowNode) => node.mode ?? KINDS[node.of].kind;

/**
 * The host half of the bargain: what a cord may do, and every edit a face
 * can make. One hook for four faces, so the faces differ in nothing but how
 * they draw.
 */
function useFlow(start: Scene) {
  const [scene, setScene] = useState<Scene>(start);
  const [picked, setPicked] = useState<string | null>(null);
  const [parked, setParked] = useState<SheetPlace | null>(null);
  const reset = useCallback(() => {
    setScene(start);
    setPicked(null);
  }, [start]);

  const patch = (id: string, change: (node: FlowNode) => FlowNode) =>
    setScene((held) => ({
      ...held,
      nodes: held.nodes.map((node) => (node.id === id ? change(node) : node)),
    }));

  const signalOf = useCallback(
    (at: string, side: 'in' | 'out'): Signal | undefined => {
      const { node: id, name } = split(at);
      const node = scene.nodes.find((each) => each.id === id);
      if (!node) return undefined;
      const spec = KINDS[node.of];
      const ports: readonly { name: string; kind: Signal }[] = side === 'in' ? spec.inlets : spec.outlets;
      return ports.find((each) => each.name === name)?.kind;
    },
    [scene.nodes],
  );

  const [refused, setRefused] = useState<string | null>(null);
  const connect = useCallback(
    (from: string, to: string) => {
      const out = signalOf(from, 'out');
      const into = signalOf(to, 'in');
      if (!out || !into) return;
      if (out !== into) {
        setRefused(`a ${SIGNAL[out]} does not go into a ${SIGNAL[into]}`);
        return;
      }
      setRefused(null);
      setScene((held) => ({
        ...held,
        cords: [...held.cords.filter((cord) => cord.to !== to), { from, to, kind: out }],
      }));
    },
    [signalOf],
  );

  return {
    scene,
    picked,
    setPicked,
    parked,
    setParked,
    refused,
    reset,
    connect,
    move: (id: string, x: number, y: number) =>
      patch(id, (node) => ({ ...node, x: Math.round(x), y: Math.round(y) })),
    cut: (to: string) =>
      setScene((held) => ({ ...held, cords: held.cords.filter((cord) => cord.to !== to) })),
    set: (id: string, inlet: string, value: number) =>
      patch(id, (node) => ({ ...node, values: { ...node.values, [inlet]: value } })),
    setDepth: (id: string, inlet: string, depth: number) =>
      patch(id, (node) => ({ ...node, depths: { ...node.depths, [inlet]: depth } })),
    setColor: (id: string, inlet: string, color: string | null) =>
      patch(id, (node) => {
        const colors = { ...node.colors };
        if (color === null) delete colors[inlet];
        else colors[inlet] = color;
        return { ...node, colors };
      }),
    setMode: (id: string, mode: string) => patch(id, (node) => ({ ...node, mode })),
    setPreview: (id: string, preview: string) => patch(id, (node) => ({ ...node, preview })),
    toggle: (id: string) => patch(id, (node) => ({ ...node, on: !node.on })),
  };
}

type Flow = ReturnType<typeof useFlow>;

/** Everything a face needs to know about one node, derived once per render. */
function useNodeView(flow: Flow, node: FlowNode, signal: ReturnType<typeof useSignal>) {
  const spec = KINDS[node.of];
  const fed = useMemo(() => new Map(flow.scene.cords.map((cord) => [cord.to, cord])), [flow.scene.cords]);
  const feeding = useMemo(() => new Set(flow.scene.cords.map((cord) => cord.from)), [flow.scene.cords]);

  /** What is driving an inlet, named the way its own face is. */
  const driverOf = (inlet: Inlet): string | undefined => {
    const cord = fed.get(port(node.id, inlet.name));
    if (!cord) return undefined;
    const { node: id, name } = split(cord.from);
    const source = flow.scene.nodes.find((each) => each.id === id);
    if (!source) return name;
    return KINDS[source.of].outlets.length > 1 ? `${faceName(source)}·${name}` : faceName(source);
  };

  /** The number a cord is carrying into an inlet right now, 0–1. */
  const liveOf = (inlet: Inlet): number | undefined => {
    const cord = fed.get(port(node.id, inlet.name));
    if (!cord || inlet.kind !== 'n') return undefined;
    const { node: id } = split(cord.from);
    const source = flow.scene.nodes.find((each) => each.id === id);
    const base = valueOf(inlet) / 100;
    const depth = node.depths[inlet.name] ?? 1;
    const s = source ? signal(source.id, source.mode) : 0.5;
    return Math.max(0, Math.min(1, base + depth * s));
  };

  const valueOf = (inlet: Inlet): number =>
    node.values[inlet.name] ?? inlet.at ?? Math.round(signal(node.id) * 100);

  const wired = (inlet: Inlet) => fed.has(port(node.id, inlet.name));
  const touched = (inlet: Inlet) =>
    inlet.kind === 'c'
      ? node.colors[inlet.name] !== undefined
      : node.values[inlet.name] !== undefined && node.values[inlet.name] !== inlet.at;

  /** What feeds the node's picture, for a node that draws what it is given. */
  const upstream = (): FlowNode | undefined => {
    const cord = flow.scene.cords.find(
      (each) => each.to === port(node.id, 'picture') && spec.picture === undefined,
    );
    if (!cord) return undefined;
    return flow.scene.nodes.find((each) => each.id === split(cord.from).node);
  };

  const previewed = node.preview ?? spec.outlets.find((each) => each.kind === 'c')?.name ?? spec.outlets[0]?.name;

  return { spec, fed, feeding, driverOf, liveOf, valueOf, wired, touched, upstream, previewed };
}

type View = ReturnType<typeof useNodeView>;

/** A port on the leading edge, with the host's own × beside it once a cord lands. */
function InletPort({ node, inlet, view, flow }: { node: FlowNode; inlet: Inlet; view: View; flow: Flow }) {
  const id = port(node.id, inlet.name);
  const taken = view.fed.has(id);
  return (
    <span className="flow-inlet">
      <Port
        id={id}
        side="in"
        label={`${inlet.name} — ${SIGNAL[inlet.kind]}`}
        showLabel={false}
        kind={inlet.kind}
        connected={taken}
      />
      {taken && (
        <button
          type="button"
          className="patch-cut"
          title={`Unwire ${inlet.name}`}
          aria-label={`Unwire ${inlet.name}`}
          onClick={() => flow.cut(id)}
        >
          ×
        </button>
      )}
    </span>
  );
}

/** The mode, in the head, as a chooser — or as a word when a cord has taken it over. */
function ModeChooser({ node, view, flow, driven }: { node: FlowNode; view: View; flow: Flow; driven: boolean }) {
  const modes = view.spec.modes;
  if (!modes || !node.mode) return null;
  return (
    <Select
      className="flow-mode"
      items={[...modes]}
      index={Math.max(0, modes.indexOf(node.mode))}
      onChange={(i) => flow.setMode(node.id, modes[i])}
      label={`Mode of ${view.spec.kind}`}
      disabled={driven}
      width={74}
    />
  );
}

/**
 * The picture, with the outlets beside it.
 *
 * On a node with several outlets, the name is the button that says which one
 * the picture shows — the picture *is* the outlet being previewed, so the
 * two are one control rather than a picture up top and a chooser five rows
 * down. One outlet is not a choice, and its name is not a button.
 */
function Screen({ node, view, flow, chip }: { node: FlowNode; view: View; flow: Flow; chip?: boolean }) {
  const source = view.upstream();
  const kind = view.spec.picture ?? (source ? KINDS[source.of].picture : undefined);
  const previewed = view.spec.outlets.find((each) => each.name === view.previewed);
  const swatch =
    view.spec.picture === 'swatch' && previewed ? PALETTE[previewed.name as keyof typeof PALETTE] : undefined;
  return (
    <Picture
      kind={kind}
      color={swatch ?? (view.spec.picture === 'scope' ? '#f0b23c' : '#f0b23c')}
      className={chip ? 'chip' : undefined}
      title={previewed ? `${view.spec.kind} · ${previewed.name}` : view.spec.kind}
    />
  );
}

function Outlets({ node, view, flow }: { node: FlowNode; view: View; flow: Flow }) {
  const many = view.spec.outlets.length > 1;
  return (
    <>
      {view.spec.outlets.map((outlet: Outlet) => {
        const id = port(node.id, outlet.name);
        const on = view.previewed === outlet.name;
        return (
          <span key={id} className="flow-outlet" {...(on ? { 'data-on': '' } : {})}>
            {many ? (
              <button
                type="button"
                className="flow-outlet-name"
                aria-pressed={on}
                title={`Show ${outlet.name} in the picture — ${outlet.about}`}
                onClick={() => flow.setPreview(node.id, outlet.name)}
              >
                {outlet.name}
              </button>
            ) : (
              <span className="flow-outlet-name" title={outlet.about}>
                {outlet.name}
              </span>
            )}
            {view.spec.picture === 'swatch' && (
              <span className="flow-swatch" style={{ background: PALETTE[outlet.name as keyof typeof PALETTE] }} />
            )}
            <Port
              id={id}
              side="out"
              label={`${outlet.name} — ${SIGNAL[outlet.kind]}`}
              showLabel={false}
              kind={outlet.kind}
              connected={view.feeding.has(id)}
            />
          </span>
        );
      })}
    </>
  );
}

/** The one line on a number row: the fader, or the switch, or the chooser under a cord. */
function NumberControl({
  node,
  inlet,
  view,
  flow,
  bare,
  plain,
}: {
  node: FlowNode;
  inlet: Inlet;
  view: View;
  flow: Flow;
  /** No caption: the row prints the name somewhere else. */
  bare?: boolean;
  /** The row as it is today, which never says who is driving it. */
  plain?: boolean;
}) {
  const driver = view.driverOf(inlet);
  const live = view.liveOf(inlet);
  const value = view.valueOf(inlet);
  const running = inlet.at === undefined && node.values[inlet.name] === undefined && !driver;
  if (inlet.group === 'mode') {
    return <ModeChooser node={node} view={view} flow={flow} driven={driver !== undefined} />;
  }
  if (inlet.toggle) {
    const on = (live !== undefined ? live * 100 : value) >= 50;
    return (
      <Toggle
        on={on}
        onChange={(next) => flow.set(node.id, inlet.name, next ? 100 : 0)}
        layout="inside"
        name={bare ? '' : inlet.name}
        label={inlet.name}
        title={inlet.about}
      >
        {on ? 'on' : 'off'}
      </Toggle>
    );
  }
  return (
    <Slider
      param={VALUE}
      value={value}
      onChange={(next) => flow.set(node.id, inlet.name, next)}
      depth={driver === undefined ? undefined : (node.depths[inlet.name] ?? 1)}
      onDepth={driver === undefined ? undefined : (d) => flow.setDepth(node.id, inlet.name, d)}
      live={live}
      name={bare ? '' : inlet.name}
      label={inlet.name}
      driver={bare || plain ? undefined : driver}
      orientation="horizontal"
      layout="inside"
      className={running ? 'is-running' : undefined}
      // On the face the track prints the live reading, because the track is
      // the whole row. On the sheet the numbers have a column of their own.
      showValue={!bare}
      display={
        bare
          ? undefined
          : live !== undefined
            ? `${Math.round(live * 100)} %`
            : inlet.display
              ? inlet.display(value)
              : undefined
      }
      title={
        driver ? `${inlet.about} — ${inlet.name} ← ${driver}` : running ? `${inlet.about} — live; drag to hold it` : inlet.about
      }
    />
  );
}

/**
 * A colour inlet: the role it falls back to, the colour picked over it, or
 * the name of what is wired in — never a dead swatch saying `wired`.
 */
function ColourControl({ node, inlet, view, flow, bare }: { node: FlowNode; inlet: Inlet; view: View; flow: Flow; bare?: boolean }) {
  const driver = view.driverOf(inlet);
  const custom = node.colors[inlet.name];
  const shown = custom ?? PALETTE[inlet.role ?? 'primary'];
  if (driver) {
    const cord = view.fed.get(port(node.id, inlet.name));
    const from = cord ? split(cord.from).name : undefined;
    const arriving = from && from in PALETTE ? PALETTE[from as keyof typeof PALETTE] : undefined;
    return (
      <span className="flow-colour" title={`${inlet.about} — ${inlet.name} ← ${driver}`}>
        {!bare && <span className="flow-colour-name">{inlet.name}</span>}
        {arriving && <span className="flow-swatch" style={{ background: arriving }} />}
        <span className="wdg-driver">← {driver}</span>
      </span>
    );
  }
  return (
    <span className="flow-colour" title={inlet.about}>
      {!bare && <span className="flow-colour-name">{inlet.name}</span>}
      <input
        type="color"
        className="flow-swatch-input"
        aria-label={`${inlet.name} colour`}
        value={shown}
        onChange={(e) => flow.setColor(node.id, inlet.name, e.target.value)}
      />
      <span className="flow-colour-role">{custom ? 'custom' : inlet.role}</span>
      {custom && (
        <button
          type="button"
          className="patch-cut"
          title={`Back to ${inlet.role}`}
          aria-label={`Reset ${inlet.name} colour`}
          onClick={() => flow.setColor(node.id, inlet.name, null)}
        >
          ↺
        </button>
      )}
    </span>
  );
}

/** One line of a face: the port, and what the inlet puts on the row. */
function InletRow({ node, inlet, view, flow, bare }: { node: FlowNode; inlet: Inlet; view: View; flow: Flow; bare?: boolean }) {
  const driver = view.driverOf(inlet);
  return (
    <DevicePortRow inlet={<InletPort node={node} inlet={inlet} view={view} flow={flow} />}>
      {inlet.kind === 'n' && !bare ? (
        <NumberControl node={node} inlet={inlet} view={view} flow={flow} />
      ) : inlet.kind === 'c' && inlet.group === 'colour' && !bare ? (
        <ColourControl node={node} inlet={inlet} view={view} flow={flow} />
      ) : (
        <span className="flow-name" title={inlet.about}>
          {inlet.name}
          {driver && <span className="wdg-driver">← {driver}</span>}
        </span>
      )}
    </DevicePortRow>
  );
}

const HEAD_END = (node: FlowNode) => (
  <Button tone="quiet" label={`Delete ${faceName(node)}`} onPress={() => {}}>
    ×
  </Button>
);


/**
 * Today: the face as the first host draws it.
 *
 * Every inlet is a row; the outlets share the inlet rows from the top down,
 * and a row whose control is wide prints no outlet name at all. The mode is
 * a chooser on the first row for the kinds that can be driven between modes,
 * and a word in the head for the ones that cannot. A wired colour is a
 * disabled swatch and the word `wired`. Reproduced here, not imported, so the
 * comparison is on one page.
 */
function TodayFace({ node, flow, signal }: { node: FlowNode; flow: Flow; signal: ReturnType<typeof useSignal> }) {
  const view = useNodeView(flow, node, signal);
  const inlets = view.spec.inlets;
  const rows = inlets.map((inlet, at) => {
    const outlet = view.spec.outlets[at];
    const wide = inlet.kind === 'n' && inlet.group !== 'mode';
    const driver = view.driverOf(inlet);
    return (
      <DevicePortRow
        key={inlet.name}
        inlet={<InletPort node={node} inlet={inlet} view={view} flow={flow} />}
        outlet={
          outlet ? (
            <Port
              id={port(node.id, outlet.name)}
              side="out"
              label={outlet.name}
              showLabel={false}
              kind={outlet.kind}
              connected={view.feeding.has(port(node.id, outlet.name))}
            />
          ) : undefined
        }
      >
        {inlet.kind === 'n' ? (
          <NumberControl node={node} inlet={inlet} view={view} flow={flow} plain />
        ) : inlet.kind === 'c' && inlet.group === 'colour' ? (
          <span className="flow-colour today" title={inlet.about}>
            <span className="flow-colour-name">{inlet.name}</span>
            <input type="color" className="flow-swatch-input" aria-label={`${inlet.name} colour`} disabled={!!driver} value={driver ? '#000000' : node.colors[inlet.name] ?? PALETTE[inlet.role ?? 'primary']} onChange={(e) => flow.setColor(node.id, inlet.name, e.target.value)} />
            <span className="flow-colour-role">{driver ? 'wired' : node.colors[inlet.name] ? 'custom' : inlet.role}</span>
          </span>
        ) : inlet.kind === 'c' ? (
          <span className="flow-colour today">
            <span className="flow-colour-name">{inlet.kind}</span>
            <input type="color" className="flow-swatch-input" aria-label={`${inlet.name} colour`} disabled value="#000000" readOnly />
            <span className="flow-colour-role">{driver ? 'wired' : 'default'}</span>
          </span>
        ) : (
          <span className="flow-name">{inlet.kind}</span>
        )}
        {outlet && !wide && (
          <button type="button" className="flow-outlet-name today" aria-pressed={view.previewed === outlet.name} onClick={() => flow.setPreview(node.id, outlet.name)}>
            {outlet.kind}
          </button>
        )}
      </DevicePortRow>
    );
  });
  // Outlets past the last inlet get lines of their own, the way they do now.
  const extra = view.spec.outlets.slice(inlets.length).map((outlet) => (
    <DevicePortRow
      key={outlet.name}
      outlet={
        <Port id={port(node.id, outlet.name)} side="out" label={outlet.name} showLabel={false} kind={outlet.kind} connected={view.feeding.has(port(node.id, outlet.name))} />
      }
    >
      <button type="button" className="flow-outlet-name today" aria-pressed={view.previewed === outlet.name} onClick={() => flow.setPreview(node.id, outlet.name)}>
        {outlet.name}
      </button>
    </DevicePortRow>
  ));
  return (
    <Device
      name={view.spec.kind}
      className="flow-face today"
      on={node.on}
      onToggle={() => flow.toggle(node.id)}
      onHotSwap={view.spec.modes ? () => {} : undefined}
      headerEnd={
        <>
          {node.mode && !inlets.some((each) => each.group === 'mode') && <span className="flow-mode-word">{node.mode}</span>}
          {HEAD_END(node)}
        </>
      }
      screen={<Screen node={node} view={view} flow={flow} />}
      portRows={
        <>
          {rows}
          {extra}
        </>
      }
    />
  );
}


/**
 * The compact face: what matters, and a count of the rest.
 *
 * Always drawn: the head with the mode in it, the picture with its outlets
 * beside it, the signals the node works on, and the mode's own controls —
 * the ones its name promises, `waves`, `depth` and `speed` on a ripple. Drawn
 * when they have earned it: any row a cord lands on, any number turned off
 * its default, any colour picked by hand. That is the rule that makes a face
 * readable coming back to a flow — what you see is what you changed and what
 * is wired, and a row at its default is not competing with them.
 *
 * Two things open the folded rows without a press. A cord in hand opens
 * every inlet on every face, because a row you cannot see is a row you
 * cannot wire to; and selecting the node opens the sheet, where all of them
 * have room. `grow` is direction B: the same face growing in place instead.
 */
function CompactFace({
  node,
  flow,
  signal,
  grow,
  fixed,
  anchor,
}: {
  node: FlowNode;
  flow: Flow;
  signal: ReturnType<typeof useSignal>;
  /** Direction B: the count opens the rows in place. */
  grow?: boolean;
  /** Direction A: the primary set only, and nothing is ever promoted. */
  fixed?: boolean;
  anchor?: RefObject<HTMLDivElement | null>;
}) {
  const view = useNodeView(flow, node, signal);
  const surface = useContext(GraphContext);
  const [open, setOpen] = useState(false);
  const inHand = surface?.cordWants === 'in';
  const picked = flow.picked === node.id;

  const modeInlet = view.spec.inlets.find((each) => each.group === 'mode');
  const modeDriven = modeInlet ? view.wired(modeInlet) : false;

  const shows = (inlet: Inlet) => {
    if (inlet.group === 'mode') return modeDriven || inHand;
    if (inlet.group === 'in' || inlet.group === 'own') return true;
    if (fixed) return false;
    return open || inHand || view.wired(inlet) || view.touched(inlet);
  };
  const shown = view.spec.inlets.filter(shows);
  const folded = view.spec.inlets.filter((each) => !shows(each) && each.group !== 'mode');

  const groups = grow && open ? ['in', 'mode', 'own', 'picture', 'colour'] : null;
  const heading = (group: string) =>
    group === 'own' ? node.mode ?? view.spec.kind : group === 'picture' ? 'picture' : group === 'colour' ? 'colours' : null;

  const rows = groups
    ? groups.flatMap((group) => {
        const these = shown.filter((each) => each.group === group);
        if (these.length === 0) return [];
        const head = heading(group);
        return [
          ...(head && group !== 'in' && group !== 'mode'
            ? [
                <DevicePortRow key={`head-${group}`} className="flow-group">
                  <Label heading>{head}</Label>
                </DevicePortRow>,
              ]
            : []),
          ...these.map((inlet) => <InletRow key={inlet.name} node={node} inlet={inlet} view={view} flow={flow} />),
        ];
      })
    : shown.map((inlet) => <InletRow key={inlet.name} node={node} inlet={inlet} view={view} flow={flow} />);

  return (
    <div ref={anchor} className="flow-anchor">
      <Device
        name={view.spec.kind}
        className={`flow-face${fixed ? ' chip' : ''}`}
        on={node.on}
        onToggle={() => flow.toggle(node.id)}
        selected={picked}
        onSelect={() => flow.setPicked(node.id)}
        headerAfterName={<ModeChooser node={node} view={view} flow={flow} driven={modeDriven} />}
        headerEnd={HEAD_END(node)}
        screen={<Screen node={node} view={view} flow={flow} />}
        outletsAt="screen"
        outlets={<Outlets node={node} view={view} flow={flow} />}
        portRows={
          <>
            {rows}
            {folded.length > 0 && !inHand && (
              <DeviceMore
                open={open}
                onToggle={(next) => {
                  if (grow) setOpen(next);
                  else flow.setPicked(node.id);
                }}
                label={fixed ? `${folded.length} more inlets` : `${folded.length} more inlets at their defaults`}
              >
                {open ? 'fewer' : fixed ? `${folded.length} more` : `${folded.length} at default`}
              </DeviceMore>
            )}
          </>
        }
      />
    </div>
  );
}


/**
 * The whole node with room to read it: every inlet, in the groups the face
 * folds by, with the caption in a column of its own and a field to type into.
 *
 * What the face cannot afford is here. A driven row prints three numbers —
 * where it sits, how far the cord may carry it and where it is now — because
 * `value + reach × signal` is three numbers, and the face's one track could
 * only show them as marks. A colour prints its role and the colour picked
 * over it. Nothing here is a control the face lacks; it is the same controls
 * with their names beside them instead of over them.
 */
function Editor({ node, flow, signal }: { node: FlowNode; flow: Flow; signal: ReturnType<typeof useSignal> }) {
  const view = useNodeView(flow, node, signal);
  const section = (group: Inlet['group'], heading: string) => {
    const these = view.spec.inlets.filter((each) => each.group === group);
    if (these.length === 0) return null;
    return (
      <SheetSection key={group} heading={heading}>
        {these.map((inlet) => {
          const driver = view.driverOf(inlet);
          const live = view.liveOf(inlet);
          const mark = <span className="flow-dot" data-kind={inlet.kind} title={SIGNAL[inlet.kind]} />;
          if (inlet.kind === 'n') {
            const value = view.valueOf(inlet);
            const driven = driver !== undefined;
            return (
              <SheetRow
                key={inlet.name}
                name={inlet.name}
                driver={driver}
                mark={mark}
                title={inlet.about}
                end={
                  inlet.group === 'mode' ? undefined : inlet.toggle ? undefined : (
                    <>
                      <NumberField
                        param={VALUE}
                        value={value}
                        onChange={(next) => flow.set(node.id, inlet.name, next)}
                        name=""
                        label={`${inlet.name} value`}
                        display={inlet.display ? inlet.display(value) : undefined}
                        width={46}
                        title={driven ? 'Where it sits. Type a number, or drag.' : 'Type a number, or drag.'}
                      />
                      {driven && (
                        <NumberField
                          param={REACH}
                          value={(node.depths[inlet.name] ?? 1) * 100}
                          onChange={(next) => flow.setDepth(node.id, inlet.name, next / 100)}
                          name=""
                          label={`${inlet.name} reach`}
                          display={`${(node.depths[inlet.name] ?? 1) >= 0 ? '+' : '−'}${Math.round(Math.abs(node.depths[inlet.name] ?? 1) * 100)} %`}
                          width={48}
                          title="How far the cord may carry it, signed. Negative runs the same cord the other way."
                        />
                      )}
                      {live !== undefined && (
                        <span className="flow-live" title="Where the cord has it now">
                          {Math.round(live * 100)} %
                        </span>
                      )}
                    </>
                  )
                }
              >
                <NumberControl node={node} inlet={inlet} view={view} flow={flow} bare />
              </SheetRow>
            );
          }
          if (inlet.group === 'colour') {
            // The control says who is driving it, beside the arriving colour.
            return (
              <SheetRow key={inlet.name} name={inlet.name} mark={mark} title={inlet.about}>
                <ColourControl node={node} inlet={inlet} view={view} flow={flow} bare />
              </SheetRow>
            );
          }
          // The driver goes in the sentence rather than after the name: a
          // signal row has no control, so the whole line is there to say it.
          return (
            <SheetRow key={inlet.name} name={inlet.name} mark={mark} title={inlet.about}>
              <span className="flow-name quiet">
                {driver ? (
                  <>
                    a {SIGNAL[inlet.kind]} from <span className="wdg-driver">{driver}</span>
                  </>
                ) : (
                  `nothing wired — ${SIGNAL[inlet.kind] === 'point' ? 'the point being asked about' : 'transparent'}`
                )}
              </span>
            </SheetRow>
          );
        })}
      </SheetSection>
    );
  };
  return (
    <>
      {section('in', 'in')}
      {section('mode', 'mode')}
      {section('own', node.mode ?? view.spec.kind)}
      {section('picture', 'picture')}
      {section('colour', 'colours')}
    </>
  );
}


function Canvas({
  flow,
  className,
  children,
}: {
  flow: Flow;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flow${className ? ` ${className}` : ''}`}>
      <Graph
        className="patch"

        cords={flow.scene.cords}
        onConnect={flow.connect}
        onMove={flow.move}
        onClearSelection={() => flow.setPicked(null)}
      >
        {children}
      </Graph>
      {flow.refused && <p className="flow-refused">{flow.refused}</p>}
    </div>
  );
}

function Toolbar({ flow }: { flow: Flow }) {
  return (
    <div className="flow-toolbar">
      <Button onPress={flow.reset}>Reset the flow</Button>
      <span className="case-hint">drag a port to wire · shift-drag a driven row for its reach · ⌘-drag for fine</span>
    </div>
  );
}

function TodayRoom({ scene }: { scene: Scene }) {
  const flow = useFlow(scene);
  const signal = useSignal();
  return (
    <div className="flow-room">
      <Toolbar flow={flow} />
      <Canvas flow={flow}>
        {flow.scene.nodes.map((node) => (
          <GraphNode key={node.id} id={node.id} x={node.x} y={node.y}>
            <TodayFace node={node} flow={flow} signal={signal} />
          </GraphNode>
        ))}
      </Canvas>
    </div>
  );
}

/**
 * A: a fixed inspector, and faces that carry only their primary set.
 *
 * Stable and roomy, and the cost is on the canvas: a `fractal` whose
 * `secondary` was picked by hand looks exactly like one that was not, and
 * every question about a node is a glance away from the node. Adjusting six
 * nodes in a row is pleasant; reading a flow you have come back to is not.
 */
function InspectorRoom({ scene }: { scene: Scene }) {
  const flow = useFlow(scene);
  const signal = useSignal();
  const picked = flow.scene.nodes.find((each) => each.id === flow.picked);
  return (
    <div className="flow-room" data-aside="">
      <div className="flow-room-main">
        <Toolbar flow={flow} />
        <Canvas flow={flow}>
          {flow.scene.nodes.map((node) => (
            <GraphNode key={node.id} id={node.id} x={node.x} y={node.y}>
              <CompactFace node={node} flow={flow} signal={signal} fixed />
            </GraphNode>
          ))}
        </Canvas>
      </div>
      <aside className="flow-inspector" aria-label="Inspector">
        {picked ? (
          <>
            <div className="flow-inspector-head">
              <span className="wdg-sheet-name">{KINDS[picked.of].kind}</span>
              {picked.mode && <span className="wdg-sheet-about">{picked.mode}</span>}
            </div>
            <Editor node={picked} flow={flow} signal={signal} />
          </>
        ) : (
          <span className="flow-inspector-empty">Select a node to see all of it here.</span>
        )}
      </aside>
    </div>
  );
}

/**
 * B: the face grows in place.
 *
 * One place for everything and no panel to look away to. The cost arrives
 * with the zoom: an open `fractal` is four hundred graph units tall, it
 * covers whatever was under it, and zoomed out to see the flow its rows are
 * as small as every other face's — unreadable exactly when there is most to
 * read.
 */
function GrowRoom({ scene }: { scene: Scene }) {
  const flow = useFlow(scene);
  const signal = useSignal();
  return (
    <div className="flow-room">
      <Toolbar flow={flow} />
      <Canvas flow={flow}>
        {flow.scene.nodes.map((node) => (
          <GraphNode key={node.id} id={node.id} x={node.x} y={node.y}>
            <CompactFace node={node} flow={flow} signal={signal} grow />
          </GraphNode>
        ))}
      </Canvas>
    </div>
  );
}

/**
 * C: the selected node's path as a device strip.
 *
 * Live's shape, and the library's native faceplate — a knob with its name
 * under it — with all the room a strip has. The strip lies about one thing
 * and cannot help it: a graph is not a chain. The oscillator driving `depth`
 * is a branch, and a strip can only put it *before* the lens with a caption
 * saying what it feeds; a `blend` with two pictures coming in has no honest
 * place in a line at all. Two drawings of one wiring, and a third of the
 * screen to draw the second one in.
 */
function StripRoom({ scene }: { scene: Scene }) {
  const flow = useFlow(scene);
  const signal = useSignal();
  const picked = flow.scene.nodes.find((each) => each.id === flow.picked) ?? null;

  /** The node, everything feeding it, and everything feeding those — as a line. */
  const path = useMemo(() => {
    if (!picked) return [];
    const seen = new Set<string>();
    const line: { node: FlowNode; feeds?: string }[] = [];
    const walk = (node: FlowNode, feeds?: string) => {
      if (seen.has(node.id)) return;
      seen.add(node.id);
      for (const cord of flow.scene.cords) {
        if (split(cord.to).node !== node.id) continue;
        const source = flow.scene.nodes.find((each) => each.id === split(cord.from).node);
        if (source) walk(source, `→ ${faceName(node)} · ${split(cord.to).name}`);
      }
      line.push({ node, feeds });
    };
    walk(picked);
    return line;
  }, [picked, flow.scene]);

  return (
    <div className="flow-room">
      <Toolbar flow={flow} />
      <Canvas flow={flow} className="short">
        {flow.scene.nodes.map((node) => (
          <GraphNode key={node.id} id={node.id} x={node.x} y={node.y}>
            <CompactFace node={node} flow={flow} signal={signal} fixed />
          </GraphNode>
        ))}
      </Canvas>
      <Chain className="flow-strip" rows={2} placeholder="Select a node to see its path here">
        {path.map(({ node, feeds }) => (
          <StripDevice key={node.id} node={node} flow={flow} signal={signal} feeds={feeds} selected={node.id === picked?.id} />
        ))}
      </Chain>
    </div>
  );
}

function StripDevice({ node, flow, signal, feeds, selected }: { node: FlowNode; flow: Flow; signal: ReturnType<typeof useSignal>; feeds?: string; selected: boolean }) {
  const view = useNodeView(flow, node, signal);
  const numbers = view.spec.inlets.filter((each) => each.kind === 'n' && each.group !== 'mode' && !each.toggle);
  return (
    <Device
      name={view.spec.kind}
      on={node.on}
      onToggle={() => flow.toggle(node.id)}
      selected={selected}
      onSelect={() => flow.setPicked(node.id)}
      headerAfterName={<ModeChooser node={node} view={view} flow={flow} driven={false} />}
      headerEnd={feeds ? <span className="flow-feeds">{feeds}</span> : undefined}
    >
      <Row>
        {numbers.slice(0, 7).map((inlet) => {
          const driver = view.driverOf(inlet);
          return (
            <Knob
              key={inlet.name}
              param={VALUE}
              value={view.valueOf(inlet)}
              onChange={(next) => flow.set(node.id, inlet.name, next)}
              name={inlet.name}
              driver={driver}
              display={driver ? `${Math.round((view.liveOf(inlet) ?? 0) * 100)} %` : inlet.display?.(view.valueOf(inlet))}
              title={inlet.about}
            />
          );
        })}
      </Row>
    </Device>
  );
}

/**
 * Recommended: the compact face on the canvas, the sheet beside the node.
 *
 * The face shows what matters and counts the rest; the count, or the node's
 * head, opens the sheet, hung beside the node at screen scale with every row
 * on it. Selecting another node moves the sheet to it. Drag the sheet's head
 * and it parks where you put it — the stable panel of A, chosen rather than
 * imposed — and the mark in its head hangs it back beside the node. Escape
 * closes it; so does a press on the empty canvas.
 */
function SheetRoom({ scene, tall }: { scene: Scene; tall?: boolean }) {
  const flow = useFlow(scene);
  const signal = useSignal();
  const anchors = useRef(new Map<string, RefObject<HTMLDivElement | null>>());
  const anchorOf = (id: string) => {
    let ref = anchors.current.get(id);
    if (!ref) {
      ref = { current: null };
      anchors.current.set(id, ref);
    }
    return ref;
  };
  const picked = flow.scene.nodes.find((each) => each.id === flow.picked) ?? null;
  const dismiss = useCallback(() => flow.setPicked(null), [flow]);

  return (
    <div className="flow-room">
      <Toolbar flow={flow} />
      <Canvas flow={flow} className={tall ? 'crowd' : undefined}>
        {flow.scene.nodes.map((node) => (
          <GraphNode key={node.id} id={node.id} x={node.x} y={node.y}>
            <CompactFace node={node} flow={flow} signal={signal} anchor={anchorOf(node.id)} />
          </GraphNode>
        ))}
      </Canvas>
      {picked && (
        <Sheet
          name={KINDS[picked.of].kind}
          about={picked.mode}
          anchor={anchorOf(picked.id)}
          parked={flow.parked}
          onPark={flow.setParked}
          onDismiss={dismiss}
          headerEnd={
            <Button tone="quiet" label="Close" onPress={dismiss}>
              ×
            </Button>
          }
        >
          <Editor node={picked} flow={flow} signal={signal} />
        </Sheet>
      )}
    </div>
  );
}


const meta = {
  title: 'Graph/Proposals',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One flow drawn four ways, so the question of what a node’s face should be once it has ten parameters can be settled with a hand on it. Today is the face as it is; A, B and C are the directions; Recommended is what they argued for.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

type SceneName = 'ripple' | 'fractal';
const SCENES: Record<SceneName, Scene> = { ripple: RIPPLE, fractal: FRACTAL };
const sceneArg = {
  args: { scene: 'ripple' as SceneName },
  argTypes: {
    scene: {
      control: 'inline-radio' as const,
      options: ['ripple', 'fractal'],
      description: 'A ripple driven by an oscillator, or a dense fractal fed one colour by the colourway.',
    },
  },
};

const room = (name: string, about: string, Room: (props: { scene: Scene }) => ReactNode): StoryObj<{ scene: SceneName }> => ({
  name,
  ...sceneArg,
  render: ({ scene }) => <Room scene={SCENES[scene]} />,
  parameters: { docs: { description: { story: about } } },
});

export const Today = room(
  'Today',
  'The face as the first host draws it now: one row per inlet, the outlets sharing those rows from the top, a wired colour as a dead swatch saying “wired”, and a driven number that looks like one you can drag. The fractal is eleven rows.',
  TodayRoom,
);

export const CompactInspector = room(
  'A · Compact face, fixed inspector',
  'Faces carry their primary set and nothing else; a panel pinned beside the canvas holds the selected node in full. Stable and roomy. On the canvas a customised node looks like an untouched one, and every question about a node is a glance away from it.',
  InspectorRoom,
);

export const ProgressiveInPlace = room(
  'B · Progressive detail, in place',
  'The compact face, and “at default” grows it in place with the rows in their groups. One place for everything. Open a fractal and zoom out: it covers its neighbours and its rows are as small as everyone’s, unreadable exactly when there is most to read.',
  GrowRoom,
);

export const ChainStrip = room(
  'C · The chain strip',
  'Select a node and its path is drawn as a device strip under the canvas — Live’s shape, with the library’s own faceplate and all the room a strip has. But a graph is not a chain: the oscillator driving depth is a branch, and the strip can only put it before the lens with a caption. Two drawings of one wiring.',
  StripRoom,
);

export const Recommended = room(
  'Recommended · Compact face, open sheet',
  'The face shows what matters — the mode’s own controls and anything wired or turned — and counts the rest. Select the node and the sheet hangs beside it at screen scale with every row on it, in groups, with a field to type into and three numbers on a driven row. Drag the sheet’s head to park it; the mark in its head hangs it back.',
  SheetRoom,
);

export const AtScale: Story = {
  name: 'Recommended · At scale',
  render: () => <SheetRoom scene={CROWD} tall />,
  parameters: {
    docs: {
      description: {
        story:
          'Ten nodes, more than fit. Zoom out until the faces are unreadable and select one: the sheet is drawn at screen scale, so a node can be read at any zoom, and the cords and pictures still say what feeds what. A cord in hand opens every inlet on every face, so a folded row can still be wired.',
      },
    },
  },
};
