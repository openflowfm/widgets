import palette from '../src/palette.css?raw';
import type_ from '../src/type.css?raw';
import widget from '../src/tokens.css?raw';

/**
 * Which custom properties the suite declares, read off the stylesheets.
 *
 * The names come from the files so the list cannot drift from them; the values
 * are asked of the page at render time, so what the docs show is what a widget
 * on that page is actually reading — including whatever a theme preset or the
 * host-tokens switch has done to it.
 */
const namesIn = (css: string): string[] =>
  [...new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]))];

/** The design language: surfaces, the text ramp, accents, radii, shadows. */
export const PALETTE_TOKENS = namesIn(palette);
/** The type stacks, sizes and tracking. */
export const TYPE_TOKENS = namesIn(type_);
/** The widget layer: `--wdg-*`, colour and type aliased from the palette, metrics its own. */
export const WIDGET_TOKENS = namesIn(widget);

/** Every palette and type token, so a wrapper can take the host's palette away. */
export const HOST_TOKENS = [...PALETTE_TOKENS, ...TYPE_TOKENS];
