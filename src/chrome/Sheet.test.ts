import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Sheet, SheetRow, SheetSection } from './Sheet.tsx';

describe('Sheet', () => {
  const anchor = { current: null };

  it('is a named region in the top layer, with the node name in its head', () => {
    const html = renderToStaticMarkup(h(Sheet, { name: 'lens', about: 'ripple', anchor }, 'rows'));
    expect(html).toContain('popover="manual"');
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="lens"');
    expect(html).toContain('<span class="wdg-sheet-name">lens</span>');
    expect(html).toContain('<span class="wdg-sheet-about">ripple</span>');
    expect(html).toContain('<div class="wdg-sheet-body">rows</div>');
  });

  it('offers to hang beside the node again only once it has been parked', () => {
    const hung = renderToStaticMarkup(h(Sheet, { name: 'lens', anchor, onPark: () => {} }));
    expect(hung).toContain('data-parkable=""');
    expect(hung).not.toContain('wdg-sheet-hang');
    const parked = renderToStaticMarkup(
      h(Sheet, { name: 'lens', anchor, onPark: () => {}, parked: { left: 40, top: 40 } }),
    );
    expect(parked).toContain('data-parked=""');
    expect(parked).toContain('aria-label="Hang beside the node"');
  });

  it('is not parkable without somewhere to report the parking to', () => {
    const html = renderToStaticMarkup(h(Sheet, { name: 'lens', anchor, parked: { left: 40, top: 40 } }));
    expect(html).not.toContain('data-parkable');
    expect(html).not.toContain('wdg-sheet-hang');
  });

  it('lays a row out as caption, control and what spells the value', () => {
    const html = renderToStaticMarkup(
      h(SheetSection, { heading: 'ripple' }, h(SheetRow, { name: 'depth', driver: 'sine', end: '71 %' }, 'track')),
    );
    expect(html).toContain('wdg-label-heading');
    expect(html).toContain('<span class="wdg-sheet-caption-text">depth</span>');
    expect(html).toContain('<span class="wdg-driver">← sine</span>');
    expect(html).toContain('<div class="wdg-sheet-control">track</div>');
    expect(html).toContain('<div class="wdg-sheet-end">71 %</div>');
  });
});
