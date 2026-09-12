import { useEffect, useRef, useState } from 'react';
import { ButtonFace } from './ButtonFace.tsx';
import { installPointing } from './pointing.ts';

/** Mount once in the application's settings/debug group, in browsers and desktop windows alike. */
export function Pointing({ className = '' }: { className?: string }) {
  const engine = useRef<ReturnType<typeof installPointing> | null>(null);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const mode = installPointing();
    engine.current = mode;
    setEnabled(false);
    return () => { mode.destroy(); engine.current = null; };
  }, []);
  return <span data-pointing-controls="" className="wdg" style={{ display: 'inline-flex', gap: 0 }}
    onKeyDown={event => event.stopPropagation()} onKeyUp={event => event.stopPropagation()}>
    <ButtonFace className={className} style={{ width: 26, flex: '0 0 26px' }}
      aria-label="Pointing mode" aria-pressed={enabled}
      title={enabled ? 'Turn off pointing mode and clear annotations' : 'Pointing mode — label clicked controls for screenshots; clicks still perform their normal actions'}
      onClick={() => { engine.current?.toggle(); setEnabled(value => !value); }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 3l6 18 3-7 7-3z" />
      </svg>
    </ButtonFace>
    {enabled && <ButtonFace className={className} style={{ minWidth: 40 }} aria-label="Clear pointing annotations"
      title="Clear annotations and restart at A" onClick={() => engine.current?.clear()}>Clear</ButtonFace>}
  </span>;
}
