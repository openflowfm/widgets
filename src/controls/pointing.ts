/** Browser-only annotation engine. No app state, transport, or React dependencies. */
export function letter(index: number): string {
  let result = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    result = String.fromCharCode(65 + (n - 1) % 26) + result;
  }
  return result;
}

export function pointingTarget(path: EventTarget[]): Element | undefined {
  const elements = path.filter((item): item is Element => item instanceof Element);
  const meaningful = elements.find(element => element.matches(
    '[data-pointing-target],button,a[href],input,select,textarea,summary,[role],label,[tabindex],[contenteditable="true"]',
  ));
  return meaningful ?? elements.find(element =>
    element.namespaceURI === 'http://www.w3.org/1999/xhtml' &&
    !element.matches('html,body,span,b,i,strong,em,small'),
  );
}

export function installPointing(doc: Document = document) {
  let enabled = false;
  let sequence = 0;
  let frame = 0;
  const host = doc.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const root = host.attachShadow({ mode: 'closed' });
  const style = doc.createElement('style');
  style.textContent = `
    :host { all: initial; }
    .mark { position:fixed;box-sizing:border-box;border:2px solid var(--color);border-radius:4px;pointer-events:none; }
    .letter { position:absolute;left:0;top:-20px;background:var(--color);color:#101014;font:bold 12px/18px system-ui;padding:0 4px;border-radius:3px 3px 0 0; }
    .status { position:fixed;right:12px;bottom:48px;padding:5px 9px;border:1px solid #777;border-radius:5px;background:#18181eef;color:#eee;font:12px/18px system-ui; }
  `;
  root.append(style);
  const status = doc.createElement('div');
  status.className = 'status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  root.append(status);
  const marks: { target: Element; box: HTMLDivElement }[] = [];
  const colors = ['#79cfff', '#ffc477', '#c4a0ff', '#7ee4ba', '#ff99bd', '#e4df7a'];
  const refresh = () => {
    frame = 0;
    for (let i = marks.length - 1; i >= 0; i--) {
      const { target, box } = marks[i];
      if (!target.isConnected) { observer.unobserve(target); box.remove(); marks.splice(i, 1); continue; }
      const rect = target.getBoundingClientRect();
      box.hidden = !rect.width || !rect.height || rect.bottom <= 0 || rect.right <= 0;
      (box.firstElementChild as HTMLElement).style.top = rect.top >= 20 ? '-20px' : '0';
      box.style.left = `${rect.left}px`;
      box.style.top = `${rect.top}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(refresh); };
  const observer = new ResizeObserver(schedule);
  const mutations = new MutationObserver(schedule);
  let down: { x: number; y: number } | undefined;
  let dragged = false;
  const pointerDown = (event: PointerEvent) => {
    down = { x: event.clientX, y: event.clientY };
    dragged = false;
  };
  const pointerMove = (event: PointerEvent) => {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) dragged = true;
  };
  const pointerEnd = () => { down = undefined; };

  const clear = () => {
    observer.disconnect();
    for (const { box } of marks) box.remove();
    marks.length = 0;
    sequence = 0;
    if (enabled) status.textContent = 'Pointing on · Pointing controls: clear or turn off';
  };
  const click = (event: MouseEvent) => {
    // A pointer click only: keyboard activation keeps its existing meaning.
    if (!event.detail || event.button !== 0 || dragged) return;
    if (event.composedPath().some(item => item instanceof Element && item.hasAttribute('data-pointing-controls'))) return;
    const target = pointingTarget(event.composedPath());
    if (!target) return;
    for (let i = marks.length - 1; i >= 0; i--) {
      if (marks[i].target === target) { marks[i].box.remove(); marks.splice(i, 1); }
    }
    const box = doc.createElement('div');
    box.className = 'mark';
    box.setAttribute('aria-hidden', 'true');
    box.style.setProperty('--color', colors[sequence % colors.length]);
    const label = letter(sequence++);
    const badge = doc.createElement('span');
    badge.className = 'letter';
    badge.textContent = label;
    box.append(badge);
    root.append(box);
    marks.push({ target, box });
    // Bound both DOM and layout work during long annotation sessions.
    if (marks.length > 100) {
      const oldest = marks.shift()!;
      oldest.box.remove();
      if (!marks.some(mark => mark.target === oldest.target)) observer.unobserve(oldest.target);
    }
    observer.observe(target);
    status.textContent = `Pointing on · ${label} · Pointing controls: clear or turn off`;
    schedule();
  };
  const toggle = () => {
    enabled = !enabled;
    if (enabled) {
      doc.documentElement.append(host);
      status.textContent = 'Pointing on · Pointing controls: clear or turn off';
      mutations.observe(doc.body, { subtree: true, childList: true, attributes: true, characterData: true });
      doc.addEventListener('pointerdown', pointerDown, { capture: true, passive: true });
      doc.addEventListener('pointermove', pointerMove, { capture: true, passive: true });
      doc.addEventListener('pointerup', pointerEnd, { capture: true, passive: true });
      doc.addEventListener('pointercancel', pointerEnd, { capture: true, passive: true });
      doc.addEventListener('click', click, { capture: true, passive: true });
      doc.addEventListener('scroll', schedule, { capture: true, passive: true });
      window.addEventListener('resize', schedule, { passive: true });
    } else {
      clear();
      mutations.disconnect();
      down = undefined;
      doc.removeEventListener('pointerdown', pointerDown, true);
      doc.removeEventListener('pointermove', pointerMove, true);
      doc.removeEventListener('pointerup', pointerEnd, true);
      doc.removeEventListener('pointercancel', pointerEnd, true);
      host.remove();
      doc.removeEventListener('click', click, true);
      doc.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  return { toggle, clear, destroy: () => { if (enabled) toggle(); else clear(); } };
}
