import { createRef, useState, type CSSProperties, type Ref } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Graph, GraphNode, type GraphView } from './Graph.tsx';
import { Port } from './Port.tsx';
import '../tokens.css';

/**
 * The graph's coordinate maths under a real engine, at a zoom other than 1.
 *
 * The content is zoomed with CSS `zoom`, and every conversion in `Graph` assumes
 * `getBoundingClientRect()` under it reports screen pixels. That is a claim about
 * the engine, so this runs in Chromium and in WebKit (the visuals app's
 * WKWebView). The ground truth is `elementFromPoint`: the engine's own hit test,
 * in the same space as a pointer's `clientX`/`clientY`. Every point a test hands
 * the graph is first checked to land on the element it is meant to.
 */

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const START = { a: { x: 40, y: 60 }, b: { x: 260, y: 140 } } as const;
type Id = keyof typeof START;

function Host({
  onConnect,
  onMove,
  viewRef,
}: {
  onConnect?(from: string, to: string): void;
  onMove?(id: string, x: number, y: number): void;
  viewRef?: Ref<GraphView>;
}) {
  const [at, setAt] = useState<Record<Id, { x: number; y: number }>>(START);
  return (
    // A node zoom of its own as well, as a host sets one: zoom inside zoom.
    <div style={{ width: 640, height: 400, '--wdg-node-zoom': 0.85 } as CSSProperties}>
      <Graph
        cords={[{ from: 'a-out', to: 'b-in' }]}
        onConnect={onConnect}
        onMove={(id, x, y) => {
          onMove?.(id, x, y);
          setAt((all) => ({ ...all, [id]: { x, y } }));
        }}
        viewRef={viewRef}
      >
        {(Object.keys(START) as Id[]).map((id) => (
          <GraphNode key={id} id={id} x={at[id].x} y={at[id].y}>
            <div
              data-testid={`face-${id}`}
              style={{
                width: 120,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#333',
              }}
            >
              <Port id={`${id}-in`} side="in" />
              <Port id={`${id}-out`} side="out" />
            </div>
          </GraphNode>
        ))}
      </Graph>
    </div>
  );
}

function setup(props: Parameters<typeof Host>[0] = {}) {
  const viewRef = createRef<GraphView>();
  const view = render(<Host {...props} viewRef={viewRef} />);
  const root = view.container;
  const port = (name: string) => view.getByRole('button', { name });
  return {
    view,
    viewport: root.querySelector<HTMLElement>('.wdg-graph')!,
    content: root.querySelector<HTMLElement>('.wdg-graph-content')!,
    port,
    face: (id: Id) => view.getByTestId(`face-${id}`),
    node: (id: Id) => view.getByTestId(`face-${id}`).parentElement!,
    scale: () => viewRef.current!.scale(),
    cord: () => root.querySelector<SVGPathElement>('.wdg-graph-cord:not([data-pending])'),
    pending: () => root.querySelector<SVGPathElement>('.wdg-graph-cord[data-pending]'),
  };
}

const centre = (el: Element) => {
  const box = el.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

/** The engine's hit test agrees that this screen point is on `el`. */
function expectHit(el: Element, p: { x: number; y: number }) {
  const hit = document.elementFromPoint(p.x, p.y);
  expect(hit !== null && el.contains(hit), `(${p.x}, ${p.y}) should hit ${el.outerHTML.slice(0, 60)}`).toBe(true);
}

/** A cord's two ends, in graph units, from its path. */
function ends(path: SVGPathElement | null) {
  const n = (path?.getAttribute('d') ?? '').match(/-?\d+(\.\d+)?(e-?\d+)?/g)!.map(Number);
  return { a: { x: n[0], y: n[1] }, b: { x: n[n.length - 2], y: n[n.length - 1] } };
}

/** Wheel at a screen point by enough to multiply the zoom by `factor`. */
function wheel(viewport: HTMLElement, p: { x: number; y: number }, factor: number) {
  fireEvent(
    viewport,
    new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      clientX: p.x,
      clientY: p.y,
      deltaY: -Math.log(factor) / 0.0015,
    }),
  );
}

function zoomTo2(g: ReturnType<typeof setup>) {
  const box = g.viewport.getBoundingClientRect();
  wheel(g.viewport, { x: box.left + 30, y: box.top + 20 }, 2);
  expect(g.scale()).toBeCloseTo(2, 5);
}

const pointer = { pointerId: 1, button: 0, buttons: 1, isPrimary: true, pointerType: 'mouse' };

describe('the graph under CSS zoom', () => {
  it('lands cord ends on port centres', () => {
    const g = setup();
    const at1 = ends(g.cord());
    zoomTo2(g);
    const at2 = ends(g.cord());
    // Graph units do not change with the view.
    expect(at2.a.x).toBeCloseTo(at1.a.x, 1);
    expect(at2.a.y).toBeCloseTo(at1.a.y, 1);
    expect(at2.b.x).toBeCloseTo(at1.b.x, 1);
    expect(at2.b.y).toBeCloseTo(at1.b.y, 1);
    // And mapped onto the screen, each end is the centre of its port.
    const origin = g.content.getBoundingClientRect();
    const k = g.scale();
    for (const [end, name] of [
      [at2.a, 'a-out'],
      [at2.b, 'b-in'],
    ] as const) {
      const onScreen = { x: origin.left + end.x * k, y: origin.top + end.y * k };
      const truth = centre(g.port(name));
      expectHit(g.port(name), truth);
      expectHit(g.port(name), onScreen);
      expect(onScreen.x).toBeCloseTo(truth.x, 0);
      expect(onScreen.y).toBeCloseTo(truth.y, 0);
    }
  });

  it('connects a drag from one port released on another, with the free end under the pointer', () => {
    const onConnect = vi.fn();
    const g = setup({ onConnect });
    zoomTo2(g);
    const from = centre(g.port('a-out'));
    const to = centre(g.port('b-in'));
    expectHit(g.port('a-out'), from);
    expectHit(g.port('b-in'), to);

    fireEvent.pointerDown(g.port('a-out'), { ...pointer, clientX: from.x, clientY: from.y });
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + 40 };
    fireEvent.pointerMove(document, { ...pointer, clientX: mid.x, clientY: mid.y });
    const free = ends(g.pending()).b;
    const origin = g.content.getBoundingClientRect();
    expect(origin.left + free.x * g.scale()).toBeCloseTo(mid.x, 0);
    expect(origin.top + free.y * g.scale()).toBeCloseTo(mid.y, 0);

    fireEvent.pointerMove(document, { ...pointer, clientX: to.x, clientY: to.y });
    fireEvent.pointerUp(document, { ...pointer, buttons: 0, clientX: to.x, clientY: to.y });
    expect(onConnect).toHaveBeenCalledExactlyOnceWith('a-out', 'b-in');
  });

  it('moves a dragged node by the pointer delta over the zoom, keeping it under the pointer', () => {
    const onMove = vi.fn();
    const g = setup({ onMove });
    zoomTo2(g);
    const k = g.scale();
    const face = g.face('a');
    const grab = centre(face);
    expectHit(face, grab);
    const before = face.getBoundingClientRect();

    fireEvent.pointerDown(face, { ...pointer, clientX: grab.x, clientY: grab.y });
    const drop = { x: grab.x + 50, y: grab.y + 30 };
    fireEvent.pointerMove(g.node('a'), { ...pointer, clientX: drop.x, clientY: drop.y });
    fireEvent.pointerUp(g.node('a'), { ...pointer, buttons: 0, clientX: drop.x, clientY: drop.y });

    expect(onMove).toHaveBeenLastCalledWith('a', START.a.x + 50 / k, START.a.y + 30 / k);
    const after = g.face('a').getBoundingClientRect();
    expect(after.left - before.left).toBeCloseTo(50, 0);
    expect(after.top - before.top).toBeCloseTo(30, 0);
    expectHit(g.face('a'), drop);
  });

  it('keeps the graph point under the pointer fixed while wheel-zooming', () => {
    const g = setup();
    zoomTo2(g);
    const port = g.port('b-in');
    const p = centre(port);
    expectHit(port, p);
    for (const factor of [1.4, 0.5]) {
      const k = g.scale();
      wheel(g.viewport, p, factor);
      expect(g.scale()).toBeCloseTo(k * factor, 5);
      const now = centre(g.port('b-in'));
      expect(now.x).toBeCloseTo(p.x, 0);
      expect(now.y).toBeCloseTo(p.y, 0);
      expectHit(g.port('b-in'), p);
    }
  });
});
