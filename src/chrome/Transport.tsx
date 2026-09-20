import { useState, type ReactNode } from 'react';
import { Button } from '../controls/Button.tsx';
import { ButtonFace } from '../controls/ButtonFace.tsx';
import { NumberField } from '../controls/NumberField.tsx';
import { Toggle } from '../controls/Toggle.tsx';
import type { Param } from '../param/param.ts';
import './chrome.css';

/**
 * Playback, the tempo it runs at, and where the head is: the group a header
 * puts in the middle of the bar.
 *
 * No audio in here. The host owns whatever engine it has and hands this the
 * facts a person needs — is it playing, can it, where is it, how fast — and
 * the commands the buttons send. Everything past play and stop is optional,
 * so a harness with nothing to loop and no tempo to set gets the two buttons
 * and a clock, and a DJ mixer gets the loop switch, the tempo field, the
 * normal-speed button and the beat counter.
 *
 * This is the transport mix[flow]'s header grew; it was extracted here once a
 * second app and the analysis harness both needed the same row.
 */

const play = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
);
const pause = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const stopMark = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="5" y="5" width="14" height="14" />
  </svg>
);
const loopMark = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 9h13l-3-3M20 15H7l3 3" />
  </svg>
);

export interface TransportLoop {
  on: boolean;
  onChange(on: boolean): void;
  title?: string;
  /** Looping a part rather than the whole: the switch takes the accent colour. */
  partial?: boolean;
}

/** The tempo as a field when `onChange` is given, and as a reading when it is not. */
export interface TransportTempo {
  param: Param;
  value: number;
  onChange?(next: number): void;
  /** What the field shows; the value formatted by the param otherwise. */
  display?: string;
  label?: string;
  title?: string;
  disabled?: boolean;
}

export interface TransportNormalSpeed {
  onPress(): void;
  disabled?: boolean;
  title?: string;
}

export interface TransportPosition {
  /** Elapsed, in seconds. */
  seconds: number;
  /** In bars, from the top. With it the reading can switch to bar.beat.sixteenth. */
  bar?: number;
  /** How many bars there are, so the counter stops at the last one. */
  bars?: number;
}

export interface TransportProps {
  playing: boolean;
  /** The play button: pressed while stopped asks for `true`, while playing for `false`. */
  onPlay(playing: boolean): void;
  /** With it, a stop button. */
  onStop?(): void;
  /** Nothing to play: the play and stop buttons are disabled. */
  disabled?: boolean;
  playTitle?: string;
  stopTitle?: string;
  loop?: TransportLoop;
  tempo?: TransportTempo;
  normalSpeed?: TransportNormalSpeed;
  position: TransportPosition;
  /** Show the clock to the millisecond, for a harness timing things. */
  fine?: boolean;
  /** The output's latency in seconds, when the engine reports one. */
  latency?: number;
  /** A `localStorage` key the position reading keeps its unit under, guarded. Left out, the choice lasts the session. */
  remember?: string;
  /** Anything else the group holds, after the reading. */
  children?: ReactNode;
  className?: string;
}

/** bar.beat.sixteenth, one-based, from a position measured in bars. */
export function positionText(bar: number, bars = Infinity): string {
  const whole = Math.floor(bar);
  const beat = Math.floor((bar - whole) * 4);
  const sixteenth = Math.floor(((bar - whole) * 4 - beat) * 4);
  return `${Math.min(whole, Math.max(0, bars - 1)) + 1}.${beat + 1}.${sixteenth + 1}`;
}

/** Minutes:seconds, to the millisecond when asked. */
export function clockText(seconds: number, fine = false): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = s - m * 60;
  return fine ? `${m}:${rest.toFixed(3).padStart(6, '0')}` : `${m}:${String(Math.floor(rest)).padStart(2, '0')}`;
}

type Unit = 'beats' | 'seconds';
const unitKept = (key: string | undefined): Unit => {
  if (!key) return 'beats';
  try { return localStorage.getItem(key) === 'seconds' ? 'seconds' : 'beats'; } catch { return 'beats'; }
};

/** The reading: a button that switches between the beat counter and the clock, when there are beats to count. */
function Position({ position, fine, remember }: { position: TransportPosition; fine?: boolean; remember?: string }) {
  const [unit, setUnit] = useState<Unit>(() => unitKept(remember));
  const clock = clockText(position.seconds, fine);
  if (position.bar === undefined) {
    return <span className="wdg-transport-clock" aria-label={`Elapsed time ${clock}`}>{clock}</span>;
  }
  const beats = unit === 'beats';
  const text = beats ? positionText(position.bar, position.bars) : clock;
  const label = beats ? `Beat position ${text}. Show elapsed time` : `Elapsed time ${text}. Show beat position`;
  const change = () => {
    const next: Unit = beats ? 'seconds' : 'beats';
    setUnit(next);
    if (remember) { try { localStorage.setItem(remember, next); } catch { /* still usable when preferences cannot be saved */ } }
  };
  return <ButtonFace className="wdg-transport-clock wdg-transport-position" aria-label={label} title={label} onClick={change}>{text}</ButtonFace>;
}

export function Transport({ playing, onPlay, onStop, disabled, playTitle, stopTitle, loop, tempo, normalSpeed, position, fine, latency, remember, children, className }: TransportProps) {
  return (
    <div className={`wdg wdg-control-group wdg-transport${className ? ` ${className}` : ''}`} role="group" aria-label="Transport">
      <Button
        onPress={() => onPlay(!playing)}
        label={playing ? 'Pause' : 'Play'}
        title={playTitle ?? (playing ? 'Pause' : 'Play')}
        width={26}
        disabled={disabled}
        className={playing ? 'wdg-transport-playing' : undefined}
      >
        {playing ? pause : play}
      </Button>
      {onStop && (
        <Button onPress={onStop} label="Stop" title={stopTitle ?? 'Stop and return to the top'} width={26} disabled={disabled}>
          {stopMark}
        </Button>
      )}
      {loop && (
        <Toggle on={loop.on} onChange={loop.onChange} label="Loop" title={loop.title ?? 'Loop'} width={26} className={loop.partial ? 'wdg-transport-looping-part' : undefined}>
          {loopMark}
        </Toggle>
      )}
      {tempo && (tempo.onChange ? (
        <NumberField
          param={tempo.param}
          value={tempo.value}
          display={tempo.display}
          onChange={tempo.onChange}
          editable
          showFill={false}
          width={44}
          label={tempo.label ?? 'Tempo'}
          disabled={tempo.disabled}
          title={tempo.title}
        />
      ) : (
        <span className="wdg-transport-clock wdg-transport-tempo" aria-label={tempo.label ?? 'Tempo'} title={tempo.title}>
          {tempo.display ?? String(tempo.value)}
        </span>
      ))}
      {normalSpeed && (
        <Button onPress={normalSpeed.onPress} label="Normal speed" disabled={normalSpeed.disabled} title={normalSpeed.title}>
          1×
        </Button>
      )}
      <Position position={position} fine={fine} remember={remember} />
      {latency !== undefined && (
        <span className="wdg-transport-latency" title="the output's latency, as the engine reports it">
          {Math.round(latency * 1000)} ms
        </span>
      )}
      {children}
    </div>
  );
}
