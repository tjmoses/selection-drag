/**
 * Add the ability to select area via mouse elements from within
 * a given container.
 */
export default function Selection({
  container,
  targetSelectors,
  options
}: {
  /** The container you'll allow selecting from. */
  container: HTMLElement | null;
  /** Valid CSS Selector string for children within the selction area. */
  targetSelectors: string;
  /** Further `optional` options. */
  options?: {
    /** The id that will be placed on the selection area div. Defaults to `selectionRectangle` */
    selectionDivId?: string;
    /** Only left clicks will enable the selection area. */
    leftClickOnly?: boolean;
  }
}) {
  const initialOptions = {
    selectionDivId: 'selectionRectangle',
    leftClickOnly: true
  };
  const _options = { ...initialOptions, ...options };

  if (!container) throw new Error('The container element must be defined!');

  const rect = document.createElement('div') as HTMLDivElement;
  rect.style.cssText = `
    border: 1px solid #4af;
    background: rgba(68, 170, 255, 0.5);
    position: absolute;
  `;
  rect.hidden = true;
  rect.id = _options.selectionDivId;
  const ctx = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  };
  const state = {
    mouseDown: false,
    moving: false,
    mounted: false,
    disabled: false
  };

  let selectedElements = [] as Element[];
  const selectStartEvent = new Event('_selectstart');

  function onMouseDown(e: MouseEvent) {
    if (state.disabled) return;
    const LEFT_CLICK = 1;
    if (_options.leftClickOnly && e.which !== LEFT_CLICK) return;
    state.mouseDown = true;
    ctx.x1 = e.pageX;
    ctx.x2 = e.pageX;
    ctx.y1 = e.pageY;
    ctx.y2 = e.pageY;
    reCalc();
  };

  function onMouseMove(e: MouseEvent) {
    if (state.disabled || !state.mouseDown) return;
    // Wait till a position is set to debounce non-selection drags.
    if (rect.hidden && !(ctx.x1 === 0 && ctx.x2 === 0 && ctx.y1 === 0 && ctx.y2 === 0)) {
      rect.hidden = false;
    }
    if (!state.mounted) {
      if (!container) throw new Error('The container element must be defined before mounting the selection rectanble!');
      container.appendChild(rect);
    }
    ctx.x2 = e.pageX;
    ctx.y2 = e.pageY;
    reCalc();

    if (state.mouseDown && !state.moving) {
      rect.dispatchEvent(selectStartEvent);
      state.moving = true;
    } else if (state.mouseDown && state.moving) {
      document.querySelectorAll(targetSelectors).forEach(ele => {
        const alreadySelected = selectedElements.indexOf(ele) !== -1;
        const eleRect = ele.getBoundingClientRect();
        const isOverlapped = checkForOverlap(eleRect);

        if (isOverlapped && !alreadySelected) {
          selectedElements.push(ele);
          rect.dispatchEvent(
            new CustomEvent('_selected', {
              detail: { addedElement: ele }
            })
          );
        } else if (!isOverlapped && alreadySelected) {
          selectedElements = selectedElements.filter(v => v !== ele);
          rect.dispatchEvent(
            new CustomEvent('_removed', {
              detail: { removedElement: ele }
            })
          );
        }
      });
    }
  };

  function onMouseUp() {
    if (!rect.hidden) rect.hidden = true;
    if (state.moving) {
      rect.dispatchEvent(
        new CustomEvent('_selectend', {
          detail: { selectedElements }
        })
      );
    }
    cleanUp();
  };

  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseup', onMouseUp);

  function reCalc() {
    const dim = getDimensions();
    rect.style.left = `${dim.xleft}px`;
    rect.style.top = `${dim.ybottom}px`;
    rect.style.width = `${dim.xright - dim.xleft}px`;
    rect.style.height = `${dim.ytop - dim.ybottom}px`;
  }

  function getDimensions() {
    return {
      xleft: Math.min(ctx.x1, ctx.x2),
      xright: Math.max(ctx.x1, ctx.x2),
      ybottom: Math.min(ctx.y1, ctx.y2),
      ytop: Math.max(ctx.y1, ctx.y2)
    };
  }

  function checkForOverlap(boundingRect: DOMRect) {
    const iRect = {
      top: boundingRect.top + window.scrollY,
      right: boundingRect.right + window.scrollX,
      bottom: boundingRect.bottom + window.scrollY,
      left: boundingRect.left + window.scrollX
    };
    const r = getDimensions();
    // We are checking if the boundingRect position is
    // within the current selection rectangle AND vice-versa.
    if (
      ((r.xleft >= iRect.left && r.xleft <= iRect.right) ||
        (r.xright >= iRect.left && r.xright <= iRect.right) ||
        (iRect.left >= r.xleft && iRect.left <= r.xright) ||
        (iRect.right >= r.xleft && iRect.right <= r.xright)) &&
      ((r.ytop >= iRect.bottom && r.ytop <= iRect.top) ||
        (r.ybottom >= iRect.bottom && r.ybottom <= iRect.top) ||
        (iRect.bottom >= r.ybottom && iRect.bottom <= r.ytop) ||
        (iRect.bottom >= r.ybottom && iRect.top <= r.ytop))
    )
      return true;
    return false;
  }

  function cleanUp() {
    state.mouseDown = false;
    state.moving = false;
    selectedElements = [];
    ctx.x1 = 0;
    ctx.y1 = 0;
    ctx.x2 = 0;
    ctx.y2 = 0;
    state.mounted = false;
    rect.remove();
  }

  function disable() {
    container?.removeEventListener('mousedown', onMouseDown);
    container?.removeEventListener('mousemove', onMouseMove);
    container?.removeEventListener('mouseup', onMouseUp);
  }

  function enable() {
    if (!container)
      throw new Error('The container element must be defined before enabling listeners!');
    container?.addEventListener('mousedown', onMouseDown);
    container?.addEventListener('mousemove', onMouseMove);
    container?.addEventListener('mouseup', onMouseUp);
  }

  return {
    /** The selection rectangle that is mounted and unmounted from the DOM. */
    rect,
    /**
     * Reset all elements/state, and unmount the selection div.
     */
    cleanUp,
    /** 
    * Disable the container event listeners.
    */
    disable,
    /** 
     * Re-add the container event listeners. Make sure to remove them first.
     */
    enable
  };
}
