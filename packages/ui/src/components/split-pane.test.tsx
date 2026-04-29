import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { SplitPane } from './split-pane';

describe('SplitPane', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  function stubContainerWidth(width: number) {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value() {
        return {
          width,
          height: 600,
          top: 0,
          left: 0,
          right: width,
          bottom: 600,
          x: 0,
          y: 0,
          toJSON() {},
        } as DOMRect;
      },
    });
  }

  it('renders both left and right children', () => {
    render(<SplitPane left={<div>Left side</div>} right={<div>Right side</div>} />);
    expect(screen.getByText('Left side')).toBeInTheDocument();
    expect(screen.getByText('Right side')).toBeInTheDocument();
  });

  it('exposes a draggable divider with separator role', () => {
    render(<SplitPane left={<div>L</div>} right={<div>R</div>} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies the default ratio to the left pane width', () => {
    const { container } = render(
      <SplitPane left={<div>L</div>} right={<div>R</div>} defaultRatio={0.4} />
    );
    const leftPane = container.querySelector('[data-slot="left"]') as HTMLElement;
    expect(leftPane).toBeTruthy();
    // 40% encoded as a flex-basis style
    expect(leftPane.style.flexBasis).toBe('40%');
  });

  it('hydrates ratio from localStorage when persistKey provided', () => {
    window.localStorage.setItem('test:ratio', '0.7');
    const { container } = render(
      <SplitPane
        left={<div>L</div>}
        right={<div>R</div>}
        defaultRatio={0.4}
        persistKey="test:ratio"
      />
    );
    const leftPane = container.querySelector('[data-slot="left"]') as HTMLElement;
    expect(leftPane.style.flexBasis).toBe('70%');
  });

  it('falls back to defaultRatio when persisted value is invalid', () => {
    window.localStorage.setItem('test:ratio', 'not-a-number');
    const { container } = render(
      <SplitPane
        left={<div>L</div>}
        right={<div>R</div>}
        defaultRatio={0.35}
        persistKey="test:ratio"
      />
    );
    const leftPane = container.querySelector('[data-slot="left"]') as HTMLElement;
    expect(leftPane.style.flexBasis).toBe('35%');
  });

  it('updates ratio while dragging the divider', () => {
    stubContainerWidth(1000);

    const { container } = render(
      <SplitPane left={<div>L</div>} right={<div>R</div>} defaultRatio={0.5} />
    );
    const divider = screen.getByRole('separator');
    const leftPane = container.querySelector('[data-slot="left"]') as HTMLElement;

    act(() => {
      fireEvent.pointerDown(divider, { clientX: 500, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerMove(window, { clientX: 250, pointerId: 1 });
    });

    expect(leftPane.style.flexBasis).toBe('25%');

    act(() => {
      fireEvent.pointerUp(window, { clientX: 250, pointerId: 1 });
    });
  });

  it('clamps ratio to minRatio / maxRatio while dragging', () => {
    stubContainerWidth(1000);

    const { container } = render(
      <SplitPane
        left={<div>L</div>}
        right={<div>R</div>}
        defaultRatio={0.5}
        minRatio={0.2}
        maxRatio={0.8}
      />
    );
    const divider = screen.getByRole('separator');
    const leftPane = container.querySelector('[data-slot="left"]') as HTMLElement;

    act(() => {
      fireEvent.pointerDown(divider, { clientX: 500, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerMove(window, { clientX: 50, pointerId: 1 });
    });
    expect(leftPane.style.flexBasis).toBe('20%');

    act(() => {
      fireEvent.pointerMove(window, { clientX: 950, pointerId: 1 });
    });
    expect(leftPane.style.flexBasis).toBe('80%');

    act(() => {
      fireEvent.pointerUp(window, { clientX: 950, pointerId: 1 });
    });
  });

  it('persists ratio on pointerup when persistKey is provided', () => {
    stubContainerWidth(1000);

    render(
      <SplitPane
        left={<div>L</div>}
        right={<div>R</div>}
        defaultRatio={0.5}
        persistKey="test:ratio"
      />
    );
    const divider = screen.getByRole('separator');

    act(() => {
      fireEvent.pointerDown(divider, { clientX: 500, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerMove(window, { clientX: 300, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerUp(window, { clientX: 300, pointerId: 1 });
    });

    expect(window.localStorage.getItem('test:ratio')).toBe('0.3');
  });

  it('does not persist when no persistKey', () => {
    stubContainerWidth(1000);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    render(<SplitPane left={<div>L</div>} right={<div>R</div>} defaultRatio={0.5} />);
    const divider = screen.getByRole('separator');

    act(() => {
      fireEvent.pointerDown(divider, { clientX: 500, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerMove(window, { clientX: 300, pointerId: 1 });
    });
    act(() => {
      fireEvent.pointerUp(window, { clientX: 300, pointerId: 1 });
    });

    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
