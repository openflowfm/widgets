// Type-level consumer check: every subpath style the suite apps (chart, mix, set,
// visuals) import resolves through the exports map to a typed declaration in
// dist/. Checked by `npm run test:package` (tsc -p test/tsconfig.json) after
// `npm run build`. A specifier that stopped resolving, or resolved to an untyped
// module, fails here (TS2307 / TS7016) rather than in an app.

import type { ReactElement } from 'react';
import { Button, Knob, Toggle, type Param } from '@openflow/widgets';
import * as ButtonModule from '@openflow/widgets/controls/Button.tsx';
import * as fill from '@openflow/widgets/controls/fill.ts';
import { Pointing } from '@openflow/widgets/controls/Pointing.tsx';
import { installPointing } from '@openflow/widgets/controls/pointing.ts';
import * as Modal from '@openflow/widgets/chrome/Modal.tsx';
import * as graphContext from '@openflow/widgets/chrome/graphContext.ts';
import * as debug from '@openflow/widgets/debug';
import * as debugIndex from '@openflow/widgets/debug/index.ts';
import * as Harness from '@openflow/widgets/debug/Harness.tsx';
import * as axis from '@openflow/widgets/debug/axis.ts';
import * as useParamGesture from '@openflow/widgets/gesture/useParamGesture.ts';
import * as MixerView from '@openflow/widgets/mixer/MixerView.tsx';
import * as mixerModel from '@openflow/widgets/mixer/model.ts';
import * as Transport from '@openflow/widgets/music/Transport.tsx';
import * as levels from '@openflow/widgets/music/levels.ts';
import * as PianoRoll from '@openflow/widgets/notation/PianoRoll.tsx';
import * as param from '@openflow/widgets/param/param.ts';
import * as ThemeRoot from '@openflow/widgets/theme/ThemeRoot.tsx';
import * as theme from '@openflow/widgets/theme/theme.ts';

export const modules = [
  ButtonModule.Button,
  fill,
  Pointing,
  installPointing,
  Modal.Modal,
  graphContext,
  debug.Scope,
  debugIndex.Plot,
  Harness.Harness,
  axis.clock,
  useParamGesture.useParamGesture,
  MixerView,
  mixerModel,
  Transport.Transport,
  levels,
  PianoRoll.PianoRoll,
  param.span,
  ThemeRoot.ThemeRoot,
  theme,
];

// The old `notation/` path is the same module as `music/`.
export const sameModule: typeof PianoRoll = {} as typeof import('@openflow/widgets/music/PianoRoll.tsx');

// Real types arrive, not `any`: a wrong prop or argument is an error.
const gain: Param = { name: 'Gain', kind: 'float', min: 0, max: 1, defaultValue: 0.5 };
export const knob: ReactElement = <Knob param={gain} value={0.5} onChange={() => {}} />;
// @ts-expect-error `value` is a number
export const badKnob = <Knob param={gain} value="loud" onChange={() => {}} />;
// @ts-expect-error `span` takes a Param
param.span(1);
export const others = [Button, Toggle];
