import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Device, DeviceMore, DevicePortRow } from './Device.tsx';
import { Port } from './Port.tsx';

describe('Device anatomy', () => {
  it('keeps the ordinary no-port body as the default', () => {
    const html = renderToStaticMarkup(h(Device, { name: 'Plain' }, 'face'));
    expect(html).toContain('<div class="wdg-device-body">face</div>');
    expect(html).not.toContain('wdg-device-main');
    expect(html).not.toContain('wdg-device-row-face');
  });

  it('keeps the legacy rails when ports are passed without rows', () => {
    const html = renderToStaticMarkup(
      h(
        Device,
        {
          name: 'Rail',
          inlets: h(Port, { id: 'in', side: 'in', label: 'In' }),
          outlets: h(Port, { id: 'out', side: 'out', label: 'Out' }),
        },
        'face',
      ),
    );
    expect(html).toContain('wdg-device-main');
    expect(html).toContain('wdg-device-ports');
    expect(html).not.toContain('wdg-device-row-face');
  });

  it('opts into fixed bands and aligned rows only when portRows is present', () => {
    const inlet = h(Port, {
      id: 'depth',
      side: 'in',
      label: 'Depth',
      showLabel: false,
    });
    const html = renderToStaticMarkup(
      h(Device, {
        name: 'Rows',
        screen: h('canvas'),
        chooser: h('select', { 'aria-label': 'Choose' }),
        outlets: h(Port, { id: 'out', side: 'out', label: 'Out' }),
        portRows: h(DevicePortRow, { inlet }, 'depth'),
      }),
    );
    expect(html).toContain('data-port-layout="rows"');
    expect(html).toContain('wdg-device-screen');
    expect(html).toContain('wdg-device-outlets');
    expect(html).toContain('wdg-device-chooser');
    expect(html).toContain('wdg-device-port-row');
    expect(html).toContain('aria-label="Depth"');
    expect(html).not.toContain('<span class="wdg-port-label">Depth</span>');
  });
});

describe('Device outlets beside the screen', () => {
  const outlet = h(Port, { id: 'out', side: 'out', label: 'Out' });
  const row = h(DevicePortRow, {}, 'depth');

  it('keeps the band under the picture by default', () => {
    const html = renderToStaticMarkup(
      h(Device, { name: 'Band', screen: h('canvas'), outlets: outlet, portRows: row }),
    );
    expect(html).not.toContain('wdg-device-screen-band');
    expect(html.indexOf('wdg-device-screen')).toBeLessThan(html.indexOf('wdg-device-outlets'));
  });

  it('stands the outlets beside the picture when asked', () => {
    const html = renderToStaticMarkup(
      h(Device, { name: 'Beside', screen: h('canvas'), outlets: outlet, outletsAt: 'screen', portRows: row }),
    );
    expect(html).toContain('wdg-device-screen-band');
    expect(html).toContain('class="wdg-device-outlets" data-beside=""');
  });

  it('has nothing to stand beside without a picture, and keeps the band', () => {
    const html = renderToStaticMarkup(
      h(Device, { name: 'No picture', outlets: outlet, outletsAt: 'screen', portRows: row }),
    );
    expect(html).not.toContain('wdg-device-screen-band');
    expect(html).toContain('class="wdg-device-outlets"');
  });
});

describe('DeviceMore', () => {
  it('is a disclosure that reports the fold and prints the count', () => {
    const html = renderToStaticMarkup(
      h(DeviceMore, { open: false, onToggle: () => {}, label: '7 more inlets' }, '7 at default'),
    );
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="7 more inlets"');
    expect(html).toContain('7 at default');
  });
});
