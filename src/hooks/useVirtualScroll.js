import { useState, useCallback, useRef, useMemo } from 'react';

/**
 * Custom Virtual Scroll Hook
 * 
 * VIRTUALIZATION MATH:
 * --------------------
 * Given:
 *   - totalItems: total number of rows in dataset
 *   - rowHeight: fixed height per row (px)
 *   - containerHeight: viewport height (px)
 *   - buffer: extra rows above/below viewport
 *   - scrollTop: current scroll position
 *
 * Calculations:
 *   totalHeight = totalItems × rowHeight
 *   visibleCount = Math.ceil(containerHeight / rowHeight)
 *   startIndex = max(0, Math.floor(scrollTop / rowHeight) - buffer)
 *   endIndex = min(totalItems - 1, startIndex + visibleCount + 2 * buffer)
 *   offsetY = startIndex × rowHeight
 *
 * Only items[startIndex..endIndex] are rendered.
 * The rendered slice is translated by offsetY to its correct scroll position.
 *
 * INTENTIONAL BUG (Stale Closure):
 * The onScroll handler below captures `items` from the initial closure.
 * If the `items` array is updated (e.g., by refetching), the scroll handler
 * still references the OLD array, causing stale row rendering until the
 * component is re-mounted or scroll state is reset. This is intentional.
 */
export function useVirtualScroll({ items, rowHeight = 50, containerHeight = 600, buffer = 5 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // INTENTIONAL BUG: `items` is captured here by the useCallback but missing
  // from the dependency array. If items changes, onScroll still references
  // the OLD items array (stale closure).
  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []); // <-- BUG: missing `items` dependency

  const totalHeight = items.length * rowHeight;
  const visibleCount = Math.ceil(containerHeight / rowHeight);

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 2 * buffer);
  const offsetY = startIndex * rowHeight;

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      ...item,
      _virtualIndex: startIndex + i,
    }));
  }, [items, startIndex, endIndex]);

  return {
    containerRef,
    onScroll,
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
  };
}
