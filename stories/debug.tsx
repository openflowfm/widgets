import type { ReactNode } from 'react';

/**
 * What the debug stories share: the column a full-width debug widget wants,
 * and a made-up signal to draw in it. No card, no note — the canvas holds the
 * widget and nothing else.
 */
export function Frame({ children }: { children: ReactNode }) {
  return <div className="case-stack">{children}</div>;
}

export const wave = (i: number, seed: number) =>
  Math.sin(i / 7 + seed) * 0.55 + Math.sin(i / 2.3 + seed * 2) * 0.3;
