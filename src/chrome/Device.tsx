import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import type { WidgetVars } from '../controls/Widget.tsx';
import './chrome.css';

/**
 * The shell Live draws around every faceplate, and the first thing in a chain
 * that isn't a control.
 *
 * None of this is a `live.*` object — the M4L palette is the set for building a
 * device, and has nothing for the device itself. It comes off the LOM instead:
 * `Device.name`, `Device.is_active`, and `Device.View.is_collapsed` are the
 * whole of what a shell shows, which is why this takes three states and not a
 * device object. Presets are the exception and stay a callback, because
 * swapping one means opening a browser this module knows nothing about.
 *
 * Folded, it becomes a strip with its name on end — the reason a long chain
 * stays readable, and the one part of Live's chrome that has no analogue in a
 * control.
 */
export interface DeviceProps {
  /** `Device.name`. Clipped rather than wrapped, like every other reading. */
  name: string;
  /** `Device.is_active`. A deactivated device dims; its controls still work. */
  on?: boolean;
  onToggle?(next: boolean): void;
  /** `Device.View.is_collapsed`. The triangle only appears if it can move. */
  folded?: boolean;
  onFold?(next: boolean): void;
  /** Which device the chain is pointing at. The chain owns this, not the device. */
  selected?: boolean;
  onSelect?(): void;
  /** The hot-swap button, shown only when the host has somewhere to send it. */
  onHotSwap?(): void;
  /** Device-specific chrome between the activator and the device name. */
  headerStart?: ReactNode;
  /** Status or mode chrome that belongs immediately after the device name. */
  headerAfterName?: ReactNode;
  /** Device-specific actions pinned to the far edge of the title bar. */
  headerEnd?: ReactNode;
  /**
   * `Port`s on the leading edge, and on the trailing one.
   *
   * In a chain these stay empty, because adjacency *is* the connection there
   * and there is nothing to draw. A graph has to draw it, so a node needs
   * somewhere for a cord to end — and it belongs to the device rather than to
   * whatever positions it, or a device inside a `Rack` could never have one.
   *
   * They are hidden while folded. Folding turns a device into a strip 17px
   * wide, which has no edges to hang a rail on — and a canvas doesn't need
   * folding anyway, having pan and zoom for the same problem a long chain has.
   * `Graph` skips a cord whose ends aren't both mounted, so a host that folds a
   * node anyway loses the drawing rather than breaking it.
   */
  inlets?: ReactNode;
  outlets?: ReactNode;
  /**
   * A picture at the top of the face, inside the frame.
   *
   * A graph preview is the first caller, and the reason this is a slot rather
   * than the top of `children` is that it sits **above the outlets** — a face
   * reads as a screen with its wiring underneath, which is the order every
   * piece of hardware this borrows from uses.
   *
   * It was briefly an overlay floating above the frame, on the argument that
   * a picture outside the box cannot be resized by the box. That is true and
   * it was the wrong trade: a node whose picture is not *in* it stops reading
   * as one thing, and the width it must not depend on is already fixed by the
   * host. Comparability comes from the fixed width, not from leaving the frame.
   */
  screen?: ReactNode;
  /**
   * The one fixed-height choice band in a row-aligned face.
   *
   * **Left out entirely when there is nothing to choose.** It used to render
   * empty so that every face kept the same anatomy, and on a canvas of small
   * nodes that reads as a band of nothing on the majority of them — the ones
   * with no mode are also the ones with least to say. A face with no chooser
   * is not a different anatomy, it is a shorter one; what must not move is a
   * port, and a band that is absent on every render of that kind moves nothing.
   *
   * Used only when `portRows` is provided; the ordinary chain face remains
   * exactly the body it has always been.
   */
  chooser?: ReactNode;
  /**
   * Opts into a face whose ports and controls share rows.
   *
   * Each child should be a `DevicePortRow`. Inlets belong on those rows rather
   * than in the legacy `inlets` rail; `outlets` move into their own fixed band
   * at the top right. CSS variables reserve empty outlet and row lines when a
   * host needs node geometry to stay fixed across face changes.
   */
  portRows?: ReactNode;
  /**
   * Where the outlets stand on a row-aligned face.
   *
   * `band` is the anatomy the first host shipped with: a line of their own
   * under the picture, which the inlet rows then share from the top down. That
   * sharing is the problem it turned out to have. A node with five outlets and
   * three inlets prints three of the outlets on the inlets' lines, where an
   * `amount` slider and a `primary` port sit on one row and read as one
   * thing — and they are not related at all.
   *
   * `screen` stands them beside the picture instead. That is where they
   * belong on a node whose picture *is* what leaves it: the outlet a host is
   * previewing is the one the picture shows, so the two are one control
   * rather than a picture up top and a chooser five rows down. The inlet rows
   * then hold nothing but inlets, and a line under the picture is exactly one
   * inlet and its control.
   *
   * Only read with `screen`; a face without a picture has nothing to stand
   * beside and keeps the band.
   */
  outletsAt?: 'band' | 'screen';
  /** The faceplate. */
  children?: ReactNode;
  /**
   * Custom properties set on this face, for the host to size its own anatomy.
   *
   * How many port rows a face holds open is the host's question, not the
   * frame's: only the host knows what else the same node could become. Same
   * typing as a control's, so a device and a widget are configured the same
   * way.
   */
  vars?: WidgetVars;
  className?: string;
  title?: string;
}

export function Device({
  name,
  on = true,
  onToggle,
  folded = false,
  onFold,
  selected = false,
  onSelect,
  onHotSwap,
  headerStart,
  headerAfterName,
  headerEnd,
  inlets,
  outlets,
  screen,
  chooser,
  portRows,
  outletsAt = 'band',
  children,
  vars,
  className,
  title,
}: DeviceProps) {
  const rowAligned = portRows !== undefined;
  const ported = inlets !== undefined || outlets !== undefined;
  const select = onSelect
    ? {
        tabIndex: 0,
        onPointerDown: () => onSelect(),
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          onSelect();
        },
      }
    : {};

  return (
    <div
      className={`wdg wdg-device${className ? ` ${className}` : ''}`}
      {...(on ? { 'data-on': '' } : {})}
      {...(folded ? { 'data-folded': '' } : {})}
      {...(selected ? { 'data-selected': '' } : {})}
      {...(rowAligned ? { 'data-port-layout': 'rows' } : {})}
      style={vars as CSSProperties | undefined}
      title={title}
    >
      <div className="wdg-device-head" {...select}>
        {onFold && (
          <button
            type="button"
            className="wdg-device-fold"
            aria-expanded={!folded}
            aria-label={`Fold ${name}`}
            onClick={() => onFold(!folded)}
          >
            <svg viewBox="0 0 8 8" aria-hidden="true">
              <path d="M1.5 2.75H6.5L4 6.25Z" />
            </svg>
          </button>
        )}
        {/* A control only where there is something to control. Without a
            `onToggle` this was still a button with a click that did nothing —
            a dot that invites the press it will not answer, which is worse on a
            canvas of forty small nodes than no dot at all. As a span it keeps
            the anatomy and stops making the offer. */}
        {onToggle ? (
          <button
            type="button"
            className="wdg-device-power"
            {...(on ? { 'data-on': '' } : {})}
            aria-pressed={on}
            aria-label={`${name} active`}
            onClick={() => onToggle(!on)}
          />
        ) : (
          <span className="wdg-device-power" {...(on ? { 'data-on': '' } : {})} aria-hidden="true" />
        )}
        {headerStart}
        <span className="wdg-device-name">{name}</span>
        {headerAfterName}
        {(onHotSwap || headerEnd) && (
          <span className="wdg-device-head-end">
            {onHotSwap && (
              <button
                type="button"
                className="wdg-device-swap"
                aria-label={`Swap ${name} preset`}
                onClick={onHotSwap}
              >
                <svg viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1.5 3.5H7.5M5.75 1.75 7.5 3.5 5.75 5.25" />
                  <path d="M8.5 6.5H2.5M4.25 4.75 2.5 6.5 4.25 8.25" />
                </svg>
              </button>
            )}
            {headerEnd}
          </span>
        )}
      </div>
      {!folded &&
        // The body stays the device's only child when there are no ports, so a
        // chain's height and stretch chain is exactly what it always was.
        (rowAligned ? (
          <div className="wdg-device-row-face">
            {screen !== undefined && outletsAt === 'screen' ? (
              <div className="wdg-device-screen-band">
                <div className="wdg-device-screen">{screen}</div>
                {outlets !== undefined && (
                  <div className="wdg-device-outlets" data-beside="">
                    {outlets}
                  </div>
                )}
              </div>
            ) : (
              <>
                {screen !== undefined && <div className="wdg-device-screen">{screen}</div>}
                {outlets !== undefined && <div className="wdg-device-outlets">{outlets}</div>}
              </>
            )}
            {chooser !== undefined && <div className="wdg-device-chooser">{chooser}</div>}
            {children !== undefined && <div className="wdg-device-body">{children}</div>}
            <div className="wdg-device-port-rows">{portRows}</div>
          </div>
        ) : ported ? (
          <div className="wdg-device-main">
            <div className="wdg-device-ports" data-side="in">
              {inlets}
            </div>
            <div className="wdg-device-body">{children}</div>
            <div className="wdg-device-ports" data-side="out">
              {outlets}
            </div>
          </div>
        ) : (
          <div className="wdg-device-body">{children}</div>
        ))}
    </div>
  );
}

export interface DevicePortRowProps {
  /** A `Port` on the leading edge. */
  inlet?: ReactNode;
  /** A `Port` on the trailing edge. */
  outlet?: ReactNode;
  /** The control or label governed by the ports on this line. */
  children?: ReactNode;
  className?: string;
}

/** One fixed-height line shared by a port and the control it governs. */
export function DevicePortRow({ inlet, outlet, children, className }: DevicePortRowProps) {
  return (
    <div className={`wdg-device-port-row${className ? ` ${className}` : ''}`}>
      <div className="wdg-device-row-port" data-side="in">
        {inlet}
      </div>
      <div className="wdg-device-row-control">{children}</div>
      <div className="wdg-device-row-port" data-side="out">
        {outlet}
      </div>
    </div>
  );
}

export interface DeviceMoreProps {
  /** Whether the rows this line stands for are showing. */
  open: boolean;
  onToggle(next: boolean): void;
  /** The accessible name, for a line whose printed text is a count. */
  label?: string;
  /** What is folded away, said as a count or a list: `7 at default`. */
  children?: ReactNode;
  className?: string;
}

/**
 * The one line on a face that stands for the rows it is not showing.
 *
 * A face that draws every inlet it has is a form by the time the node has
 * ten of them, and most of those ten are sitting at the number they were
 * born with. A face that draws only the rows that *matter* — the mode's own
 * controls, and anything wired or turned — needs to say what it left out, or
 * the rows it folded read as rows the node does not have. This is that
 * sentence, at the height of a row, at the indent of a control, so it reads as
 * the last line of the list rather than as a button under it.
 *
 * It says how many, never "advanced". Advanced is a judgement about the
 * person; a count is a fact about the node, and a count that reads `7 at
 * default` also tells you the seven have not been touched — which is the one
 * thing worth knowing about them.
 *
 * What opening it does is the host's: a face may grow in place, or the host
 * may open the rest somewhere with more room. Either way the line itself only
 * reports the state, the way every control here does.
 */
export function DeviceMore({ open, onToggle, label, children, className }: DeviceMoreProps) {
  return (
    <button
      type="button"
      className={`wdg-device-more${className ? ` ${className}` : ''}`}
      aria-expanded={open}
      aria-label={label}
      onClick={() => onToggle(!open)}
    >
      <svg viewBox="0 0 8 8" aria-hidden="true">
        <path d="M1.5 2.75H6.5L4 6.25Z" />
      </svg>
      <span className="wdg-device-more-text">{children}</span>
    </button>
  );
}
