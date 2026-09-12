// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installPointing, letter, pointingTarget } from './pointing.ts';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('pointing references', () => {
  it('continues past Z without ambiguous repeated letters', () => {
    expect([0, 25, 26, 51, 52, 701, 702].map(letter)).toEqual(['A', 'Z', 'AA', 'AZ', 'BA', 'ZZ', 'AAA']);
  });
  it('chooses the control around an SVG and an explicit component around text', () => {
    document.body.innerHTML = '<button><svg><path /></svg></button><section data-pointing-target><span>Text</span></section>';
    const path = document.querySelector('path')!;
    expect(pointingTarget([path, path.parentElement!, document.querySelector('button')!, document.body])).toBe(document.querySelector('button'));
    expect(pointingTarget([document.querySelector('span')!, document.querySelector('section')!])).toBe(document.querySelector('section'));
    expect(pointingTarget([document.body, document.documentElement])).toBeUndefined();
  });
  it('passes clicks through, ignores drags and keyboard clicks, and resets to A', () => {
    const attach = Element.prototype.attachShadow;
    let shadow: ShadowRoot;
    vi.spyOn(Element.prototype, 'attachShadow').mockImplementation(function (this: Element, init) {
      shadow = attach.call(this, init); return shadow;
    });
    document.body.innerHTML = '<button><span>Play</span></button>';
    const button = document.querySelector('button')!;
    const handler = vi.fn();
    button.addEventListener('click', handler);
    const mode = installPointing();
    const click = () => button.firstElementChild!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1, cancelable: true }));
    click();
    expect(shadow!.querySelectorAll('.mark')).toHaveLength(0);
    mode.toggle();
    expect(click()).toBe(true);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(shadow!.querySelector('.letter')!.textContent).toBe('A');
    const ownControl = document.createElement('button');
    ownControl.setAttribute('data-pointing-controls', '');
    document.body.append(ownControl);
    ownControl.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(shadow!.querySelector('.letter')!.textContent).toBe('A');
    button.click();
    expect(shadow!.querySelectorAll('.mark')).toHaveLength(1);
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0 }));
    button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 30 }));
    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 30 }));
    click();
    expect(shadow!.querySelectorAll('.mark')).toHaveLength(1);
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    click();
    expect(shadow!.querySelectorAll('.mark')).toHaveLength(1);
    expect(shadow!.querySelector('.letter')!.textContent).toBe('B');
    mode.clear();
    click();
    expect(shadow!.querySelector('.letter')!.textContent).toBe('A');
    mode.toggle();
    expect(shadow!.host.isConnected).toBe(false);
    click();
    expect(shadow!.querySelectorAll('.mark')).toHaveLength(0);
  });
});
