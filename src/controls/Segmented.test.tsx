// @vitest-environment happy-dom
import { render, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Segmented } from './Segmented.tsx';
afterEach(cleanup);

const radios = (view: ReturnType<typeof render>) => view.getAllByRole('radio');

describe('the names a screen reader reads', () => {
  it('names each radio by its text when no labels are given', () => {
    const view = render(<Segmented items={['LP', 'HP']} index={0} onChange={() => {}} label="Filter" />);
    expect(view.getByRole('radiogroup', { name: 'Filter' })).toBeTruthy();
    expect(view.getByRole('radio', { name: 'LP' })).toBeTruthy();
    expect(radios(view).every((r) => !r.hasAttribute('aria-label'))).toBe(true);
  });

  it('names each radio by its label, keeping the glyph on screen', () => {
    const view = render(<Segmented items={['s', 'bar']} itemLabels={['seconds', 'bars']} index={1} onChange={() => {}} label="Unit" />);
    const seconds = view.getByRole('radio', { name: 'seconds' });
    expect(seconds.textContent).toBe('s');
    expect(seconds.getAttribute('aria-checked')).toBe('false');
    expect(view.getByRole('radio', { name: 'bars' }).getAttribute('aria-checked')).toBe('true');
  });

  it('falls back to the text for a member with no label or an empty one', () => {
    const view = render(<Segmented items={['s', 'bar', 'beat']} itemLabels={['seconds', '']} index={0} onChange={() => {}} />);
    expect(radios(view).map((r) => r.getAttribute('aria-label'))).toEqual(['seconds', null, null]);
    expect(view.getByRole('radio', { name: 'bar' })).toBeTruthy();
    expect(view.getByRole('radio', { name: 'beat' })).toBeTruthy();
  });
});

describe('the keys', () => {
  it('still moves the choice with the arrows, and only the chosen radio takes Tab', () => {
    const onChange = vi.fn();
    const view = render(<Segmented items={['s', 'bar']} itemLabels={['seconds', 'bars']} index={0} onChange={onChange} />);
    expect(radios(view).map((r) => r.tabIndex)).toEqual([0, -1]);
    fireEvent.keyDown(view.getByRole('radiogroup'), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(view.getByRole('radio', { name: 'bars' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });
});
