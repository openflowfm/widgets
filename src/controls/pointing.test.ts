// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installPointing, letter, pointingTarget, pointingTargetAt } from './pointing.ts';

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
  it('finds an individual disabled button skipped by pointer hit testing inside a group', () => {
    const { mode, shadow } = fixture('<div role="group"><button disabled style="pointer-events:none"><svg><path /></svg></button><button disabled style="pointer-events:none">Right</button></div>');
    const group = document.querySelector('div')!;
    const [left, right] = document.querySelectorAll('button');
    rect(group, 0, 0, 80, 30); rect(left, 0, 0, 30, 30); rect(right, 40, 0, 30, 30);
    expect(pointingTargetAt([group, document.body], 10, 10)).toBe(left);
    expect(pointingTargetAt([group, document.body], 50, 10)).toBe(right);
    expect(pointingTargetAt([group, document.body], 35, 10)).toBe(group);
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe');
    mode.toggle();
    pointer(group, 'pointerdown', { clientX: 10, clientY: 10 });
    pointer(group, 'pointerup', { clientX: 10, clientY: 10 });
    expect(observe).toHaveBeenLastCalledWith(left);
    expect(shadow.querySelector('.letter')!.textContent).toBe('A');
    expect(left.disabled).toBe(true);
    expect(left.style.pointerEvents).toBe('none');
    mode.destroy();
  });
  it('excludes invisible targets and pointing controls from geometry selection', () => {
    document.body.innerHTML = '<div role="group"><button style="visibility:hidden">Hidden</button><button data-pointing-controls>Pointing</button><button>Visible</button></div>';
    const group = document.querySelector('div')!;
    rect(group, 0, 0, 100, 100);
    const [hidden, own, visible] = document.querySelectorAll('button');
    rect(hidden, 0, 0, 10, 10); rect(own, 0, 0, 15, 15); rect(visible, 0, 0, 30, 30);
    expect(pointingTargetAt([group, document.body], 5, 5)).toBe(visible);
  });
  it('marks completed pointer gestures on disabled controls without enabling or clicking them', () => {
    const { mode, shadow } = fixture('<button disabled><span>Stop</span></button><div>Read-only surface</div>');
    const button = document.querySelector('button')!;
    const action = vi.fn();
    button.addEventListener('click', action);
    mode.toggle();
    gesture(button.firstElementChild!);
    expect(shadow.querySelector('.letter')!.textContent).toBe('A');
    expect(button.disabled).toBe(true);
    expect(action).not.toHaveBeenCalled();
    gesture(document.querySelector('div')!);
    expect([...shadow.querySelectorAll('.letter')].map(node => node.textContent)).toEqual(['A', 'B']);
    mode.destroy();
  });
  it('lets enabled actions run once, excludes its controls, and resets to A', () => {
    const { mode, shadow } = fixture('<button><span>Play</span></button><button data-pointing-controls>Clear</button>');
    const button = document.querySelector('button')!;
    const action = vi.fn();
    button.addEventListener('click', action);
    mode.toggle();
    gesture(button.firstElementChild!);
    button.click();
    expect(action).toHaveBeenCalledTimes(1);
    expect(shadow.querySelector('.letter')!.textContent).toBe('A');
    gesture(document.querySelector('[data-pointing-controls]')!);
    expect(shadow.querySelectorAll('.mark')).toHaveLength(1);
    mode.clear();
    gesture(button);
    expect(shadow.querySelector('.letter')!.textContent).toBe('A');
    mode.toggle();
    gesture(button);
    expect(shadow.host.isConnected).toBe(false);
    expect(shadow.querySelectorAll('.mark')).toHaveLength(0);
  });
  it('ignores keyboard clicks, drags, canceled gestures, other pointers, and secondary buttons', () => {
    const { mode, shadow } = fixture('<button>Control</button>');
    const target = document.querySelector('button')!;
    mode.toggle();
    target.click();
    pointer(target, 'pointerup');
    pointer(target, 'pointerdown');
    pointer(target, 'pointermove', { clientX: 30 });
    pointer(target, 'pointerup'); // Returning to the start is still a drag.
    pointer(target, 'pointerdown');
    pointer(target, 'pointerup', { clientX: 30 }); // No intermediate move is needed.
    pointer(target, 'pointerdown');
    pointer(target, 'pointercancel');
    pointer(target, 'pointerup');
    pointer(target, 'pointerdown', { button: 2 });
    pointer(target, 'pointerup', { button: 2 });
    pointer(target, 'pointerdown');
    pointer(target, 'pointerup', { pointerId: 2 });
    pointer(target, 'pointercancel');
    pointer(target, 'pointerdown');
    document.dispatchEvent(new Event('scroll'));
    pointer(target, 'pointerup');
    expect(shadow.querySelectorAll('.mark')).toHaveLength(0);
    gesture(target);
    expect(shadow.querySelector('.letter')!.textContent).toBe('A');
    mode.destroy();
  });
});

function fixture(html: string) {
  const attach = Element.prototype.attachShadow;
  let shadow!: ShadowRoot;
  vi.spyOn(Element.prototype, 'attachShadow').mockImplementation(function (this: Element, init) {
    shadow = attach.call(this, init); return shadow;
  });
  document.body.innerHTML = html;
  const mode = installPointing();
  return { mode, shadow };
}
function pointer(target: Element, type: string, options: PointerEventInit = {}) {
  const event = new PointerEvent(type, { bubbles: true, composed: true, cancelable: true,
    pointerId: 1, isPrimary: true, button: 0, clientX: 0, clientY: 0, ...options });
  expect(target.dispatchEvent(event)).toBe(true);
  expect(event.defaultPrevented).toBe(false);
}
function gesture(target: Element) {
  pointer(target, 'pointerdown');
  pointer(target, 'pointerup');
}

function rect(element: Element, x: number, y: number, width: number, height: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, y, width, height));
}
