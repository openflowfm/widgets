import { useLayoutEffect, useRef, useState } from 'react';
import { ColorItem, ColorPalette } from '@storybook/addon-docs/blocks';
import { PRESETS } from '../src/theme/theme.ts';
import { resolveTheme } from '../src/theme/resolve.ts';

/**
 * The tokens, as the page sees them.
 *
 * A table of names and *live* values: each is read off a probe element with
 * `getComputedStyle`, so the number shown is the number a widget on this page
 * would get — after the theme picker and the host-tokens switch have had their
 * say. Colour values also get a swatch.
 */
export function TokenTable({ names }: { names: readonly string[] }) {
  const probe = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const read = () => {
      const style = getComputedStyle(el);
      setValues(Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()])));
    };
    read();
    // A theme or host-token change re-renders the docs page, but the probe's
    // computed style settles after paint; look once more then.
    const frame = requestAnimationFrame(read);
    return () => cancelAnimationFrame(frame);
  }, [names]);

  return (
    <div ref={probe} className="wdg">
      <table className="sb-tokens">
        <thead>
          <tr>
            <th>token</th>
            <th>value</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => {
            const value = values[name] ?? '';
            return (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td>
                  {looksLikeColor(value) && <span className="sb-swatch" style={{ background: value }} />}
                  <code>{value || '—'}</code>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const looksLikeColor = (value: string) =>
  /^(#|rgb|hsl|color-mix|color\()/.test(value) || /^[a-z]+$/.test(value) && CSS.supports('color', value);

/** Every preset's roles and surfaces, resolved to the strings a host would set. */
export function PresetPalettes() {
  return (
    <>
      {PRESETS.map(({ name, theme }) => {
        const { tokens } = resolveTheme(theme);
        const pick = (keys: string[]) => Object.fromEntries(keys.map((k) => [k.replace(/^--/, ''), tokens[k as `--${string}`]]));
        return (
          <div key={name}>
            <h3>{name}</h3>
            <ColorPalette>
              <ColorItem title="roles" subtitle="primary, signal, and the six stems" colors={pick(['--primary', '--signal', '--stem-drums', '--stem-bass', '--stem-other', '--stem-vocals', '--stem-guitar', '--stem-piano'])} />
              <ColorItem title="decks" subtitle="A and C from the base tones, B and D offset by the variation" colors={pick(['--deck-a', '--deck-b', '--deck-c', '--deck-d'])} />
              <ColorItem title="status" subtitle="danger, success, info, caution, preview" colors={pick(['--danger', '--success', '--info', '--caution', '--preview'])} />
              <ColorItem title="surfaces" subtitle="the page, a panel, a rail, a selection" colors={pick(['--bg', '--panel', '--rail', '--sel', '--surface-control', '--surface-cell'])} />
              <ColorItem title="text ramp" subtitle="strong to idle" colors={pick(['--fg', '--ui', '--detail', '--caption', '--idle'])} />
              <ColorItem title="edges" subtitle="border, quiet border, control border, focus" colors={pick(['--bd', '--bd2', '--bd3', '--focus'])} />
            </ColorPalette>
          </div>
        );
      })}
    </>
  );
}
