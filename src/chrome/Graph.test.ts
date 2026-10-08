import { describe, expect, it } from 'vitest';
import { contentStyle, cordInk } from './Graph.tsx';

describe('the content box', () => {
  it('zooms with CSS zoom, not a scale transform, so faces re-lay out crisp', () => {
    const style = contentStyle({ x: 40, y: -10, k: 2 });
    expect(style.zoom).toBe(2);
    expect(String(style.transform)).not.toContain('scale');
  });

  it('divides the pan by the zoom, since a zoomed box translates in zoomed pixels', () => {
    expect(contentStyle({ x: 40, y: -10, k: 2 }).transform).toBe('translate(20px, -5px)');
    expect(contentStyle({ x: 40, y: -10, k: 1 }).transform).toBe('translate(40px, -10px)');
  });
});

describe('cord colour by kind', () => {
  it('reads the host token named for the kind, falling back to the plain cord', () => {
    expect(cordInk('audio')).toBe('var(--wdg-cord-audio, var(--wdg-cord))');
  });

  it('turns characters a custom property cannot hold into dashes', () => {
    expect(cordInk('mid side/2')).toBe('var(--wdg-cord-mid-side-2, var(--wdg-cord))');
  });
});
