import type { Meta, StoryObj } from '@storybook/react-vite';
import { XYPad } from './XYPad.tsx';
import { FREQ, GAIN, Held, PAN, note } from '../../stories/parts.tsx';

const meta = {
  title: 'Controls/XY pad',
  component: XYPad,
  tags: ['autodocs'],
  args: {
    x: { param: FREQ, value: 440, onChange: () => {} },
    y: { param: GAIN, value: 0, onChange: () => {} },
    label: 'Frequency and gain',
  },
} satisfies Meta<typeof XYPad>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Something for the plane to draw over, standing in for a device's own curve. */
function PadGrid() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {[25, 50, 75].map((at) => (
        <line key={`v${at}`} x1={at} y1="0" x2={at} y2="100" stroke="#2c2c31" strokeWidth="0.4" />
      ))}
      {[25, 50, 75].map((at) => (
        <line key={`h${at}`} x1="0" y1={at} x2="100" y2={at} stroke="#2c2c31" strokeWidth="0.4" />
      ))}
    </svg>
  );
}

export const TwoParameters: Story = {
  parameters: note(
    "Two parameters on one pointer. Press anywhere and the handle comes to you, then stays with the pointer — a plane is the one control that doesn't grab where its value already is. The fine modifier and double-click to reset work as they do on a knob, and each axis takes the arrows on its own tab stop.",
  ),
  render: () => (
    <Held param={FREQ}>
      {(hz, setHz) => (
        <Held param={GAIN}>
          {(db, setDb) => (
            <XYPad
              x={{ param: FREQ, value: hz, onChange: setHz }}
              y={{ param: GAIN, value: db, onChange: setDb }}
              label="Frequency and gain"
            />
          )}
        </Held>
      )}
    </Held>
  ),
};

export const OverArtwork: Story = {
  parameters: note(
    "Wider than it is tall, with artwork behind it — the slot a device's response curve goes in. The plane owns the geometry and the gesture and knows nothing about what's drawn under it.",
    { wide: true },
  ),
  render: () => (
    <Held param={FREQ}>
      {(hz, setHz) => (
        <Held param={GAIN}>
          {(db, setDb) => (
            <XYPad
              x={{ param: FREQ, value: hz, onChange: setHz }}
              y={{ param: GAIN, value: db, onChange: setDb }}
              width={260}
              height={110}
              label="Frequency and gain over a grid"
            >
              <PadGrid />
            </XYPad>
          )}
        </Held>
      )}
    </Held>
  ),
};

export const TaperedAxis: Story = {
  parameters: note(
    "A tapered axis reads as position: the frequency's exponent puts a third of the plane under the first 200 Hz, exactly as it puts a third of a knob's travel there.",
  ),
  render: () => (
    <Held param={FREQ}>
      {(hz, setHz) => (
        <Held param={PAN}>
          {(pan, setPan) => (
            <XYPad
              x={{ param: FREQ, value: hz, onChange: setHz }}
              y={{ param: PAN, value: pan, onChange: setPan }}
              label="Frequency and pan"
            />
          )}
        </Held>
      )}
    </Held>
  ),
};

export const Disabled: Story = {
  parameters: note('Disabled.'),
  args: {
    x: { param: FREQ, value: 440, onChange: () => {} },
    y: { param: GAIN, value: 0, onChange: () => {} },
    label: 'Frequency and gain',
    disabled: true,
  },
};
