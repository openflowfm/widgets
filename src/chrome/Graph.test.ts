import { describe, expect, it } from 'vitest';
import { cordInk } from './Graph.tsx';

describe('cord colour by kind', () => {
  it('reads the host token named for the kind, falling back to the plain cord', () => {
    expect(cordInk('audio')).toBe('var(--wdg-cord-audio, var(--wdg-cord))');
  });

  it('turns characters a custom property cannot hold into dashes', () => {
    expect(cordInk('mid side/2')).toBe('var(--wdg-cord-mid-side-2, var(--wdg-cord))');
  });
});
