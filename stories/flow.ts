import type { GraphCord } from '../src/chrome/Graph.tsx';

/**
 * A made-up flow in a node editor's vocabulary, for the proposal stories.
 *
 * The proposals in `src/chrome/Proposals.stories.tsx` are about what a node's
 * face should be when the node has ten parameters, and an argument about
 * density is only worth having over real density: a `fractal` with three
 * colours and seven numbers, a `lens` whose depth is being driven, a
 * `colorway` with five named outlets. So the words here are a real host's —
 * the same three signals, the same inlets, the same defaults — and the
 * numbers are the ones its own faces start at. Nothing of that host is
 * imported: this is a table, and it ships nowhere.
 */
export type Signal = 'p' | 'n' | 'c';

/** What each signal is called on a face, in full. */
export const SIGNAL: Record<Signal, string> = { p: 'point', n: 'number', c: 'picture' };

/**
 * Which shelf of a face an inlet sits on.
 *
 * `in` is the signal the node works on and is always drawn. `mode` is the
 * number that picks the mode, which the head shows as a chooser until a cord
 * lands on it. `own` are the mode's own controls — the ones its name promises.
 * `picture` are the adjustments every generator shares, and `colour` the
 * colours; those two are what a compact face folds when nothing has touched
 * them.
 */
export type Group = 'in' | 'mode' | 'own' | 'picture' | 'colour';

export type ColorRole = 'primary' | 'secondary' | 'complement' | 'accent' | 'chalk';

/** One colourway, dealt once so every story shows the same five. */
export const PALETTE: Record<ColorRole, string> = {
  primary: '#e35b9f',
  secondary: '#9a5cff',
  complement: '#6fd0c8',
  accent: '#f5a742',
  chalk: '#efe6f2',
};

export interface Inlet {
  name: string;
  kind: Signal;
  group: Group;
  /** Where a number sits until somebody turns it, 0–100. A live one has none. */
  at?: number;
  /** The palette role an unwired colour falls back to. */
  role?: ColorRole;
  /** A switch rather than a fader. */
  toggle?: boolean;
  /** A reading in the inlet's own units, where a percent is not what it means. */
  display?: (value: number) => string;
  about: string;
}

export interface Outlet {
  name: string;
  kind: Signal;
  about: string;
}

export type PictureKind =
  | 'checker'
  | 'plasma'
  | 'mandelbrot'
  | 'ripple'
  | 'kaleido'
  | 'swatch'
  | 'scope';

export interface KindSpec {
  kind: string;
  modes?: readonly string[];
  inlets: readonly Inlet[];
  outlets: readonly Outlet[];
  /** What its own picture is, or nothing for a node that shows what it is fed. */
  picture?: PictureKind;
  about: string;
}

const DIVISIONS = ['1/16', '1/8', '1/4', '1/2', '1/1', '2/1', '4/1'];

const point = (about: string): Inlet => ({ name: 'point', kind: 'p', group: 'in', about });
const pic = (about: string): Inlet => ({ name: 'picture', kind: 'c', group: 'in', about });
const mode = (modes: readonly string[]): Inlet => ({
  name: 'mode',
  kind: 'n',
  group: 'mode',
  about: `Which mode this is in — ${modes.join(', ')}. Wire a number to move between them.`,
});
const n = (name: string, group: Group, about: string, at = 50): Inlet => ({
  name,
  kind: 'n',
  group,
  at,
  about,
});
const colour = (name: string, role: ColorRole, about: string): Inlet => ({
  name,
  kind: 'c',
  group: 'colour',
  role,
  about,
});

const BRIGHTNESS = n('brightness', 'picture', 'How brightly the colours are drawn.');
const CONTRAST = n('contrast', 'picture', 'How strongly dark and light colours separate.');
const RATE = n('rate', 'picture', 'The beat division that advances the animation.');

export const KINDS: Record<string, KindSpec> = {
  source: {
    kind: 'source',
    modes: ['solid', 'bars', 'rings', 'noise', 'grid', 'plasma', 'checker', 'sparks'],
    about: 'A generated picture, drawn at a point and animated by the room.',
    picture: 'checker',
    inlets: [
      mode(['plasma', 'checker']),
      point('Where in the generated picture to read.'),
      n('tiles', 'own', 'How many tiles divide the frame.'),
      BRIGHTNESS,
      CONTRAST,
      RATE,
      colour('color', 'primary', 'The main colour of the picture.'),
      colour('secondary', 'complement', 'The alternate colour of the picture.'),
    ],
    outlets: [{ name: 'picture', kind: 'c', about: 'The generated picture.' }],
  },
  plasma: {
    kind: 'source',
    modes: ['solid', 'bars', 'rings', 'noise', 'grid', 'plasma', 'checker', 'sparks'],
    about: 'A generated picture, drawn at a point and animated by the room.',
    picture: 'plasma',
    inlets: [
      mode(['plasma', 'checker']),
      point('Where in the generated picture to read.'),
      n('weave', 'own', 'How tightly the pattern is woven.'),
      BRIGHTNESS,
      CONTRAST,
      RATE,
      colour('color', 'primary', 'The main colour of the picture.'),
      colour('secondary', 'complement', 'The alternate colour of the picture.'),
    ],
    outlets: [{ name: 'picture', kind: 'c', about: 'The generated picture.' }],
  },
  lens: {
    kind: 'lens',
    modes: ['zoom', 'swirl', 'fold', 'wobble', 'tile', 'mirror', 'kaleido', 'twist', 'ripple', 'slice', 'pixelate', 'creep'],
    about: 'Move the point a picture is read at, or apply a geometry effect at that moved point.',
    picture: 'ripple',
    inlets: [
      mode(['ripple', 'kaleido']),
      point('The position to transform.'),
      pic('The picture to read through the transformed position.'),
      n('waves', 'own', 'How many wave fronts cross the picture.'),
      n('depth', 'own', 'How far the ripple displaces the picture beneath it.'),
      n('speed', 'own', 'How quickly each ripple travels away from the centre.'),
      RATE,
      n('frequency', 'picture', 'The spacing multiplier of the ripple waves.'),
    ],
    outlets: [
      { name: 'point', kind: 'p', about: 'The transformed position.' },
      { name: 'picture', kind: 'c', about: 'The input picture read at the transformed position.' },
    ],
  },
  kaleido: {
    kind: 'lens',
    modes: ['zoom', 'swirl', 'fold', 'wobble', 'tile', 'mirror', 'kaleido', 'twist', 'ripple', 'slice', 'pixelate', 'creep'],
    about: 'Move the point a picture is read at, or apply a geometry effect at that moved point.',
    picture: 'kaleido',
    inlets: [
      mode(['ripple', 'kaleido']),
      point('The position to transform.'),
      pic('The picture to read through the transformed position.'),
      n('segments', 'own', 'How many mirrored wedges make up the kaleidoscope.'),
      n('spin', 'own', 'How much the kaleidoscope turns with the beat.'),
      n('segment-offset', 'picture', 'Additional mirrored wedges in the kaleidoscope.'),
    ],
    outlets: [
      { name: 'point', kind: 'p', about: 'The transformed position.' },
      { name: 'picture', kind: 'c', about: 'The input picture read at the transformed position.' },
    ],
  },
  lfo: {
    kind: 'lfo',
    modes: ['sine', 'triangle', 'saw', 'ramp', 'square', 'pulse', 'noise', 'sample-hold'],
    about: 'A low-frequency oscillator that follows straight note divisions or runs freely in hertz.',
    picture: 'scope',
    inlets: [
      mode(['sine', 'triangle', 'square']),
      { name: 'clock', kind: 'n', group: 'own', about: 'The phase to run on. The beat, until something else is wired here.' },
      {
        name: 'rate',
        kind: 'n',
        group: 'own',
        at: 66,
        display: (v) => DIVISIONS[Math.min(DIVISIONS.length - 1, Math.floor((v / 100) * DIVISIONS.length))],
        about: 'The note period the clock is divided into when synced, or a frequency when free.',
      },
      { name: 'sync', kind: 'n', group: 'own', at: 100, toggle: true, about: 'Divide the clock at one; run on elapsed seconds at zero.' },
      { name: 'phase', kind: 'n', group: 'own', at: 0, display: (v) => `${Math.round(v * 3.6)}°`, about: 'Offset the oscillator by zero to one complete cycle.' },
    ],
    outlets: [{ name: 'number', kind: 'n', about: 'The oscillator value from zero to one.' }],
  },
  fractal: {
    kind: 'fractal',
    modes: ['mandelbrot', 'julia'],
    about: 'A bounded iterative picture with an explicit GPU budget, offered as Mandelbrot or Julia.',
    picture: 'mandelbrot',
    inlets: [
      point('Where in the fractal plane to read.'),
      n('zoom', 'own', 'How deeply the fractal is magnified, on a bounded logarithmic scale.', 0),
      n('turn', 'own', 'How far, and in which direction, the picture rotates.'),
      n('detail', 'own', 'How many bounded orbit steps are used to reveal fine structure.', 35),
      BRIGHTNESS,
      CONTRAST,
      RATE,
      n('interior-brightness', 'picture', 'How brightly the interior of the fractal is filled.'),
      colour('color', 'primary', 'The main colour of the picture.'),
      colour('secondary', 'complement', 'The alternate colour of the picture.'),
      colour('interior-color', 'primary', 'The colour inside the fractal.'),
    ],
    outlets: [{ name: 'picture', kind: 'c', about: 'The generated fractal picture.' }],
  },
  colorway: {
    kind: 'colorway',
    about: 'The colourway that is up, as five colours named for the job each does.',
    picture: 'swatch',
    inlets: [
      n('amount', 'own', 'The opacity of every colour taken from here.', 100),
      n('brightness', 'own', 'The brightness of the palette colours.', 67),
      n('contrast', 'own', 'The contrast of the palette colours.', 0),
    ],
    outlets: [
      { name: 'primary', kind: 'c', about: 'The colour that carries the picture.' },
      { name: 'secondary', kind: 'c', about: 'The neighbour in the harmony.' },
      { name: 'complement', kind: 'c', about: 'The opposing colour, taken loud.' },
      { name: 'accent', kind: 'c', about: 'For what is small and wants to be seen.' },
      { name: 'chalk', kind: 'c', about: "Light and coloured. The palette's answer to white." },
    ],
  },
  out: {
    kind: 'out',
    about: 'What reaches the wall.',
    inlets: [pic('The finished picture.')],
    outlets: [],
  },
};

export interface FlowNode {
  id: string;
  /** A key into `KINDS`, which fixes the kind and the mode together. */
  of: string;
  mode?: string;
  x: number;
  y: number;
  /** Numbers set on inlets, 0–100, keyed by inlet name. Absent is the default. */
  values: Record<string, number>;
  /** How far a cord may carry a wired number, signed, -1..1. Absent is 1. */
  depths: Record<string, number>;
  /** Colours picked by hand on colour inlets. */
  colors: Record<string, string>;
  /** Which outlet the picture shows, on a node with several. */
  preview?: string;
  on: boolean;
}

export interface Scene {
  nodes: FlowNode[];
  cords: GraphCord[];
}

const node = (
  id: string,
  of: string,
  x: number,
  y: number,
  extra: Partial<FlowNode> = {},
): FlowNode => ({
  id,
  of,
  mode: KINDS[of].modes ? (of === 'source' ? 'checker' : of === 'lens' ? 'ripple' : of === 'lfo' ? 'sine' : of === 'fractal' ? 'mandelbrot' : of === 'plasma' ? 'plasma' : of === 'kaleido' ? 'kaleido' : undefined) : undefined,
  x,
  y,
  values: {},
  depths: {},
  colors: {},
  on: true,
  ...extra,
});

export const port = (id: string, name: string) => `${id}/${name}`;

/** The checker feeds the lens while a sine LFO drives its depth. */
export const RIPPLE: Scene = {
  nodes: [
    node('checker', 'source', 30, 30),
    node('wave', 'lfo', 30, 340),
    node('lens', 'lens', 290, 30, { values: { depth: 50 }, depths: { depth: 0.4 } }),
    node('output', 'out', 560, 30),
  ],
  cords: [
    { from: port('checker', 'picture'), to: port('lens', 'picture'), kind: 'c' },
    { from: port('wave', 'number'), to: port('lens', 'depth'), kind: 'n' },
    { from: port('lens', 'picture'), to: port('output', 'picture'), kind: 'c' },
  ],
};

/** A dense node fed one colour by the colourway, so a colour row is wired. */
export const FRACTAL: Scene = {
  nodes: [
    node('palette', 'colorway', 30, 30),
    node('mandel', 'fractal', 290, 30, { values: { turn: 62, detail: 35 }, colors: { secondary: '#4ad3ff' } }),
    node('output', 'out', 560, 30),
  ],
  cords: [
    { from: port('palette', 'accent'), to: port('mandel', 'color'), kind: 'c' },
    { from: port('mandel', 'picture'), to: port('output', 'picture'), kind: 'c' },
  ],
};

/** Enough nodes that they cannot all stay open, laid out the way a real flow sprawls. */
export const CROWD: Scene = {
  nodes: [
    node('plasma', 'plasma', 30, 30),
    node('checker', 'source', 30, 330),
    node('pulse', 'lfo', 30, 620, { mode: 'square' }),
    node('kaleido', 'kaleido', 290, 30, { values: { segments: 70 } }),
    node('ripple', 'lens', 290, 330, { values: { depth: 40 }, depths: { depth: 0.5 } }),
    node('wave', 'lfo', 290, 620),
    node('palette', 'colorway', 550, 330),
    node('mandel', 'fractal', 550, 30, { values: { zoom: 20 } }),
    node('slow', 'lfo', 550, 620, { mode: 'triangle', values: { rate: 20 } }),
    node('output', 'out', 820, 30),
  ],
  cords: [
    { from: port('plasma', 'picture'), to: port('kaleido', 'picture'), kind: 'c' },
    { from: port('checker', 'picture'), to: port('ripple', 'picture'), kind: 'c' },
    { from: port('wave', 'number'), to: port('ripple', 'depth'), kind: 'n' },
    { from: port('pulse', 'number'), to: port('kaleido', 'spin'), kind: 'n' },
    { from: port('slow', 'number'), to: port('mandel', 'zoom'), kind: 'n' },
    { from: port('palette', 'accent'), to: port('mandel', 'color'), kind: 'c' },
    { from: port('kaleido', 'point'), to: port('mandel', 'point'), kind: 'p' },
    { from: port('mandel', 'picture'), to: port('output', 'picture'), kind: 'c' },
  ],
};
