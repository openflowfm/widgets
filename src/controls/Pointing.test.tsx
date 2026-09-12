// @vitest-environment happy-dom
import { StrictMode } from 'react';
import { fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Pointing } from './Pointing.tsx';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('works through strict mount cleanup, exposes active state and Clear, and isolates toolbar keys', () => {
  const view = render(<StrictMode><Pointing /></StrictMode>);
  const toggle = view.getByRole('button', { name: 'Pointing mode' });
  expect(toggle.getAttribute('aria-pressed')).toBe('false');
  expect(view.queryByRole('button', { name: 'Clear pointing annotations' })).toBeNull();
  fireEvent.click(toggle);
  expect(toggle.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(view.getByRole('button', { name: 'Clear pointing annotations' }));
  const appKey = vi.fn();
  window.addEventListener('keydown', appKey);
  fireEvent.keyDown(toggle, { key: ' ' });
  expect(appKey).not.toHaveBeenCalled();
  window.removeEventListener('keydown', appKey);
  fireEvent.click(toggle);
  expect(view.queryByRole('button', { name: 'Clear pointing annotations' })).toBeNull();
});
