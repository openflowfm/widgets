import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Label } from '../controls/Label.tsx';
import './chrome.css';

/**
 * A node's whole face, hung beside the node.
 *
 * A node on a canvas is the size of what it holds, and what it holds grows:
 * a face with ten inlets is a form by the time every one of them has a row.
 * The face's answer is to show the rows that matter and count the rest (see
 * [`DeviceMore`](./Device.tsx)); this is where the rest go. It is the same
 * plate and the same head, so it reads as *that node, opened out*, and it is
 * hung off the node rather than pinned to an edge of the window, because the
 * question it answers — what else does this one do — is asked while looking
 * at the node, and a panel across the screen is a panel you look away to.
 *
 * It is drawn at **screen scale** while the node is drawn at the canvas's.
 * That is the other half of the argument for a sheet rather than a face that
 * grows in place: zoomed out to see a whole flow, every face is too small to
 * read, and the sheet is not, so the way to read a node at any zoom is to
 * select it. A face that grew in place would be as unreadable as its
 * neighbours exactly when there was most to read.
 *
 * It follows the node. A canvas pans and zooms under a transform, which
 * fires neither `scroll` nor `resize`, so the anchor is re-measured on a
 * frame clock while the sheet is up and moved only when the measurement
 * changed — one `getBoundingClientRect` a frame, and no render at all.
 *
 * **Parking** is the host's escape from the following. Drag the head and it
 * stays where it was put, reported through `onPark`, and from then on
 * selecting another node changes what it shows and not where it is — which is
 * the stable panel a person adjusting six nodes in a row wants, chosen rather
 * than imposed. The button in its head hangs it back beside the node.
 *
 * `popover="manual"` for the reason [`Popup`](./Popup.tsx) uses it: the top
 * layer is the only place that escapes a canvas's transform and its overflow
 * without bidding for a `z-index`. Dismissal is the host's — the sheet is up
 * while a node is selected, and the canvas already clears a selection on an
 * empty press — except for Escape, which reaches the host through
 * `onDismiss` because only the host knows where focus should go back to.
 */
export interface SheetPlace {
  left: number;
  top: number;
}

export interface SheetProps {
  /** The node's name, printed in the head the way the node prints it. */
  name: string;
  /** A word after the name in the caption ink: the mode, or what kind it is. */
  about?: string;
  /** The node the sheet belongs to, re-measured while the sheet is up. */
  anchor: RefObject<HTMLElement | null>;
  /**
   * Where it has been parked, in viewport px, or nothing to hang beside the
   * node. The host holds it, so a sheet parked for one node stays parked for
   * the next.
   */
  parked?: SheetPlace | null;
  /** Dragging the head parks it; the head's own button hands back `null`. */
  onPark?(at: SheetPlace | null): void;
  /** Escape was pressed while the sheet was up. */
  onDismiss?(how: 'escape'): void;
  /** Actions pinned to the far edge of the head. */
  headerEnd?: ReactNode;
  /** The accessible name. Defaults to the node's. */
  label?: string;
  className?: string;
  children?: ReactNode;
}

/** Room between the node and the sheet, and between the sheet and the window's edge. */
const GAP = 8;
const MARGIN = 4;

export function Sheet({
  name,
  about,
  anchor,
  parked = null,
  onPark,
  onDismiss,
  headerEnd,
  label,
  className,
  children,
}: SheetProps) {
  const box = useRef<HTMLDivElement>(null);
  const was = useRef<string>('');
  const drag = useRef<{ dx: number; dy: number; left: number; top: number } | null>(null);

  /**
   * Beside the node, on whichever side has the room: right first, because a
   * cord leaves to the right and the eye follows it; left when the right is
   * off the window; under the node when neither side is. Parked, it goes
   * where it was put, clamped so a window that shrank cannot lose it.
   */
  const place = useCallback(() => {
    const el = box.current;
    if (!el || drag.current) return;
    const size = el.getBoundingClientRect();
    let left: number;
    let top: number;
    if (parked) {
      left = parked.left;
      top = parked.top;
    } else {
      const at = anchor.current?.getBoundingClientRect();
      if (!at) return;
      const right = at.right + GAP;
      const leftOf = at.left - GAP - size.width;
      if (right + size.width <= window.innerWidth - MARGIN) left = right;
      else if (leftOf >= MARGIN) left = leftOf;
      else left = at.left;
      top = left === at.left && right + size.width > window.innerWidth - MARGIN ? at.bottom + GAP : at.top;
    }
    left = Math.max(MARGIN, Math.min(left, window.innerWidth - size.width - MARGIN));
    top = Math.max(MARGIN, Math.min(top, window.innerHeight - size.height - MARGIN));
    const key = `${left},${top}`;
    if (key === was.current) return;
    was.current = key;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [anchor, parked]);

  useLayoutEffect(() => {
    try {
      box.current?.showPopover?.();
    } catch {
      // Already open, or a DOM with no top layer. Neither is worth a throw.
    }
    was.current = '';
    place();
  }, [place]);

  useEffect(() => {
    let frame = requestAnimationFrame(function follow() {
      place();
      frame = requestAnimationFrame(follow);
    });
    const escape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !onDismiss) return;
      e.preventDefault();
      e.stopPropagation();
      onDismiss('escape');
    };
    window.addEventListener('keydown', escape, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', escape, true);
    };
  }, [place, onDismiss]);

  const grab = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!onPark || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, select, textarea, [role="slider"]')) return;
    const el = box.current;
    if (!el) return;
    const at = el.getBoundingClientRect();
    drag.current = { dx: e.clientX - at.left, dy: e.clientY - at.top, left: at.left, top: at.top };
    el.setAttribute('data-dragging', '');
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const held = drag.current;
    const el = box.current;
    if (!held || !el) return;
    const size = el.getBoundingClientRect();
    held.left = Math.max(MARGIN, Math.min(e.clientX - held.dx, window.innerWidth - size.width - MARGIN));
    held.top = Math.max(MARGIN, Math.min(e.clientY - held.dy, window.innerHeight - size.height - MARGIN));
    el.style.left = `${held.left}px`;
    el.style.top = `${held.top}px`;
  };

  const drop = (e: ReactPointerEvent<HTMLDivElement>) => {
    const held = drag.current;
    const el = box.current;
    if (!held || !el) return;
    drag.current = null;
    el.removeAttribute('data-dragging');
    e.currentTarget.releasePointerCapture(e.pointerId);
    was.current = `${held.left},${held.top}`;
    onPark?.({ left: held.left, top: held.top });
  };

  return (
    <div
      ref={box}
      className={`wdg wdg-sheet${className ? ` ${className}` : ''}`}
      popover="manual"
      role="region"
      aria-label={label ?? name}
      {...(onPark ? { 'data-parkable': '' } : {})}
      {...(parked ? { 'data-parked': '' } : {})}
    >
      <div
        className="wdg-sheet-head"
        onPointerDown={grab}
        onPointerMove={move}
        onPointerUp={drop}
        onPointerCancel={drop}
      >
        <span className="wdg-sheet-name">{name}</span>
        {about && <span className="wdg-sheet-about">{about}</span>}
        <span className="wdg-sheet-head-end">
          {parked && onPark && (
            <button
              type="button"
              className="wdg-sheet-hang"
              title="Hang it beside the node again"
              aria-label="Hang beside the node"
              onClick={() => onPark(null)}
            >
              ⌖
            </button>
          )}
          {headerEnd}
        </span>
      </div>
      <div className="wdg-sheet-body">{children}</div>
    </div>
  );
}

export interface SheetSectionProps {
  /** The heading over the group, set the way every section heading here is. */
  heading: string;
  children?: ReactNode;
  className?: string;
}

/** A group of rows under one heading: the mode's own, the picture's, the colours. */
export function SheetSection({ heading, children, className }: SheetSectionProps) {
  return (
    <section className={`wdg-sheet-section${className ? ` ${className}` : ''}`}>
      <Label heading>{heading}</Label>
      {children}
    </section>
  );
}

export interface SheetRowProps {
  /** The caption, in its own column. */
  name: string;
  /** What is moving this row, printed after the name in the fill ink. */
  driver?: string;
  /** Something small before the name: the port's dot, in the kind's colour. */
  mark?: ReactNode;
  /** The control. */
  children?: ReactNode;
  /** What spells the value: a field to type into, a reading, a unit. */
  end?: ReactNode;
  title?: string;
  className?: string;
}

/** One line of a sheet: caption, control, and what spells the value. */
export function SheetRow({ name, driver, mark, children, end, title, className }: SheetRowProps) {
  return (
    <div className={`wdg-sheet-row${className ? ` ${className}` : ''}`} title={title}>
      <span className="wdg-sheet-caption">
        {mark}
        <span className="wdg-sheet-caption-text">{name}</span>
        {driver && <span className="wdg-driver">← {driver}</span>}
      </span>
      <div className="wdg-sheet-control">{children}</div>
      <div className="wdg-sheet-end">{end}</div>
    </div>
  );
}
