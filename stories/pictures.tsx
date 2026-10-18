import { useEffect, useRef } from 'react';
import { PALETTE, type PictureKind } from './flow.ts';

/**
 * A still frame for a node's picture, painted once on a small canvas.
 *
 * The proposals are about how much room a picture takes on a face and what
 * stands beside it, and a grey box saying "live picture" cannot settle that:
 * a real picture pulls the eye, and whether the outlets beside it read as
 * belonging to it is a question about a real picture. These are four
 * functions of a point, painted at the face's own resolution — a checker, a
 * plasma, an escape-time Mandelbrot, a ripple sampled through the checker —
 * and nothing more than that. The renderer they stand in for is a host's.
 */
type RGB = [number, number, number];

const rgb = (hex: string): RGB => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const scale = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k];

const PRIMARY = rgb(PALETTE.primary);
const COMPLEMENT = rgb(PALETTE.complement);
const SECONDARY = rgb(PALETTE.secondary);
const CHALK = rgb(PALETTE.chalk);
const INTERIOR: RGB = [42, 11, 37];

type Painter = (x: number, y: number) => RGB;

const checker: Painter = (x, y) =>
  scale((Math.floor(x * 16) + Math.floor(y * 9)) % 2 === 0 ? PRIMARY : COMPLEMENT, 0.82);

const plasma: Painter = (x, y) => {
  const v =
    Math.sin(x * 6.1 + 1.3) +
    Math.sin(y * 5.3 + 2.1) +
    Math.sin((x + y) * 4.4) +
    Math.sin(Math.hypot(x - 0.5, y - 0.5) * 12.0);
  const t = (v + 4) / 8;
  return scale(mix(SECONDARY, COMPLEMENT, t), 0.55 + 0.45 * Math.abs(t - 0.5) * 2);
};

const mandelbrot: Painter = (x, y) => {
  const cx = -2.05 + x * 2.9;
  const cy = -0.82 + y * 1.64;
  let zx = 0;
  let zy = 0;
  const most = 48;
  let k = 0;
  while (k < most && zx * zx + zy * zy < 4) {
    const nx = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = nx;
    k += 1;
  }
  if (k === most) return INTERIOR;
  const t = Math.min(1, Math.log(1 + k) / Math.log(1 + most));
  return t < 0.55 ? mix(PRIMARY, COMPLEMENT, t / 0.55) : mix(COMPLEMENT, CHALK, (t - 0.55) / 0.45);
};

const ripple: Painter = (x, y) => {
  const dx = x - 0.5;
  const dy = (y - 0.5) * (9 / 16);
  const r = Math.hypot(dx, dy) + 1e-6;
  const d = Math.sin(r * 44 - 1.7) * 0.028;
  return checker(x + (d * dx) / r, y + (d * dy) / r);
};

const kaleido: Painter = (x, y) => {
  const dx = x - 0.5;
  const dy = (y - 0.5) * (9 / 16);
  const r = Math.hypot(dx, dy);
  const wedge = Math.PI / 3;
  let a = Math.atan2(dy, dx);
  a = Math.abs(((a % wedge) + wedge) % wedge - wedge / 2);
  return plasma(0.5 + Math.cos(a) * r * 1.6, 0.5 + Math.sin(a) * r * 1.6);
};

const PAINTERS: Partial<Record<PictureKind, Painter>> = { checker, plasma, mandelbrot, ripple, kaleido };

/** The widths the small faces draw at; the real ones are the same 16:9. */
const WIDE = 176;
const TALL = 99;

function paint(canvas: HTMLCanvasElement, kind: PictureKind, color: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvas.width = WIDE;
  canvas.height = TALL;
  if (kind === 'swatch') {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, WIDE, TALL);
    return;
  }
  if (kind === 'scope') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDE, TALL);
    ctx.strokeStyle = '#1f1f24';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo((WIDE / 4) * i, 0);
      ctx.lineTo((WIDE / 4) * i, TALL);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, TALL / 2);
    ctx.lineTo(WIDE, TALL / 2);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let px = 0; px <= WIDE; px += 1) {
      const y = TALL / 2 - Math.sin((px / WIDE) * Math.PI * 2) * (TALL / 2 - 6);
      if (px === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.stroke();
    ctx.fillStyle = '#ececed';
    ctx.beginPath();
    ctx.arc(WIDE * 0.31, TALL / 2 - Math.sin(0.31 * Math.PI * 2) * (TALL / 2 - 6), 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const painter = PAINTERS[kind];
  if (!painter) return;
  const image = ctx.createImageData(WIDE, TALL);
  const data = image.data;
  for (let py = 0; py < TALL; py += 1) {
    for (let px = 0; px < WIDE; px += 1) {
      const [r, g, b] = painter((px + 0.5) / WIDE, (py + 0.5) / TALL);
      const at = (py * WIDE + px) * 4;
      data[at] = r;
      data[at + 1] = g;
      data[at + 2] = b;
      data[at + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

export function Picture({
  kind,
  color = '#f0b23c',
  className,
  title,
}: {
  kind: PictureKind | undefined;
  /** The swatch's colour, or the scope's ink. */
  color?: string;
  className?: string;
  title?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvas.current && kind) paint(canvas.current, kind, color);
  }, [kind, color]);
  return (
    <canvas
      ref={canvas}
      className={`flow-picture${className ? ` ${className}` : ''}`}
      {...(kind ? {} : { 'data-empty': '' })}
      title={title}
      aria-hidden="true"
    />
  );
}
