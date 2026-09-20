// @vitest-environment happy-dom
import { fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Transport, clockText, positionText } from './Transport.tsx';

const KEY = 'test.transport-position';
afterEach(() => { cleanup(); localStorage.removeItem(KEY); vi.restoreAllMocks(); });

it('sends play, pause and stop, and leaves out what it is not handed', () => {
  const onPlay = vi.fn(), onStop = vi.fn();
  const view = render(<Transport playing={false} onPlay={onPlay} onStop={onStop} position={{ seconds: 61.2 }} />);
  fireEvent.click(view.getByRole('button', { name: 'Play' }));
  expect(onPlay).toHaveBeenCalledWith(true);
  fireEvent.click(view.getByRole('button', { name: 'Stop' }));
  expect(onStop).toHaveBeenCalledOnce();
  expect(view.getByLabelText('Elapsed time 1:01').textContent).toBe('1:01');
  expect(view.queryByRole('button', { name: 'Loop' })).toBeNull();
  expect(view.queryByLabelText('Tempo')).toBeNull();
  view.rerender(<Transport playing onPlay={onPlay} position={{ seconds: 61.2 }} fine latency={0.0116} />);
  fireEvent.click(view.getByRole('button', { name: 'Pause' }));
  expect(onPlay).toHaveBeenLastCalledWith(false);
  expect(view.queryByRole('button', { name: 'Stop' })).toBeNull();
  expect(view.getByText('1:01.200')).toBeTruthy();
  expect(view.getByText('12 ms')).toBeTruthy();
});

it('shows the tempo as a reading without onChange and as a field with it', () => {
  const param = { kind: 'float', min: 20, max: 999, defaultValue: 120, unit: 'custom', customUnit: '%0.1f' } as const;
  const view = render(<Transport playing={false} onPlay={() => {}} position={{ seconds: 0 }} tempo={{ param, value: 128, display: '128', label: 'Playback tempo' }} />);
  expect(view.queryByRole('slider', { name: 'Playback tempo' })).toBeNull();
  expect(view.getByLabelText('Playback tempo').textContent).toBe('128');
  const onChange = vi.fn();
  view.rerender(<Transport playing={false} onPlay={() => {}} position={{ seconds: 0 }} tempo={{ param, value: 128, display: '128', label: 'Playback tempo', onChange }} normalSpeed={{ onPress: () => {}, disabled: true }} />);
  expect(view.getByRole('slider', { name: 'Playback tempo' })).toBeTruthy();
  expect((view.getByRole('button', { name: 'Normal speed' }) as HTMLButtonElement).disabled).toBe(true);
});

it('defaults the reading to beats, toggles to elapsed time, keeps updating, and remembers the unit', () => {
  const view = render(<Transport playing={false} onPlay={() => {}} position={{ bar: 2.3125, bars: 32, seconds: 187.9 }} remember={KEY} />);
  const button = view.getByRole('button', { name: 'Beat position 3.2.2. Show elapsed time' });
  expect(button.textContent).toBe('3.2.2');
  fireEvent.click(button);
  expect(button.textContent).toBe('3:07');
  expect(button.getAttribute('aria-label')).toBe('Elapsed time 3:07. Show beat position');
  view.rerender(<Transport playing={false} onPlay={() => {}} position={{ bar: 3, bars: 32, seconds: 188.2 }} remember={KEY} />);
  expect(button.textContent).toBe('3:08');
  view.unmount();
  const restored = render(<Transport playing={false} onPlay={() => {}} position={{ bar: 3, bars: 32, seconds: 189 }} remember={KEY} />);
  const reading = restored.getByRole('button', { name: /Elapsed time/ });
  expect(reading.textContent).toBe('3:09');
  fireEvent.click(reading);
  expect(reading.textContent).toBe('4.1.1');
});

it('recovers invalid or unavailable preference storage', () => {
  localStorage.setItem(KEY, 'invalid');
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('unavailable'); });
  const view = render(<Transport playing={false} onPlay={() => {}} position={{ bar: 0, bars: 1, seconds: -5 }} remember={KEY} />);
  const reading = view.getByRole('button', { name: /Beat position/ });
  expect(reading.textContent).toBe('1.1.1');
  fireEvent.click(reading);
  expect(reading.textContent).toBe('0:00');
});

it('formats positions and clocks', () => {
  expect(positionText(5.5, 4)).toBe('4.3.1');
  expect(clockText(75.4321)).toBe('1:15');
  expect(clockText(75.4321, true)).toBe('1:15.432');
  expect(clockText(-3, true)).toBe('0:00.000');
});
