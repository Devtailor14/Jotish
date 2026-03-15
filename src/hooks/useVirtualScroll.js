import { useState, useCallback, useRef, useMemo } from 'react';

export function useVirtualScroll({ items, rowHeight = 50, containerHeight = 600, buffer = 5 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const onScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

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
