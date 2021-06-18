import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export default function VirtualList<T>({
  rowHeight,
  height,
  buffers = 10,
  dataSource,
  render,
  scrollTo,
  wraperStyle = {},
  scrollStyle = {},
  renderStyle = {},
  gap = 0,
  wraperClassName = '',
  scrollClassName = '',
  renderClassName = '',
  onIndexChange,
}: {
  rowHeight: number,
  height: number,
  buffers?: number,
  dataSource: T[],
  render: (data: T, index: number) => JSX.Element,
  scrollTo?: {to: number},
  wraperStyle?: CSSProperties,
  scrollStyle?: CSSProperties,
  renderStyle?: CSSProperties,
  gap?: number,
  wraperClassName?: string,
  scrollClassName?: string,
  renderClassName?: string,
  onIndexChange?: (change: number[]) => void,

}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [originStartIndex, setOriginStartIndex] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const rowOffsetHeightRef = useRef(rowHeight)

  const rowOffsetHeight = useMemo(() => rowHeight + gap, [gap, rowHeight])

  const limit = useMemo(() => Math.ceil(height / rowOffsetHeight), [height, rowOffsetHeight])

  const count = useMemo(() => dataSource.length, [dataSource])

  const [endIndex, setEndIndex] = useState(() => Math.min(startIndex + limit + buffers, count - 1))

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (scrollRef?.current === e.target) {
      const { scrollTop } = scrollRef?.current
      const index = Math.floor(scrollTop / rowOffsetHeight)
      if (originStartIndex !== index) {
        const start = Math.max(index - buffers, 0)
        const end = Math.min(index + limit + buffers, count - 1)
        setOriginStartIndex(index)
        setStartIndex(start)
        setEndIndex(end)
        onIndexChange && onIndexChange([start, end])
      }
    }
  }, [buffers, count, limit, onIndexChange, originStartIndex, rowOffsetHeight])

  const renderRow = useCallback((index: number, style: CSSProperties) => (
    <div className={renderClassName} key={index} style={style}>{render(dataSource[index], index)}</div>
  ), [dataSource, render, renderClassName])

  const renderRows = useCallback(() => {
    const results: JSX.Element[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      if (dataSource[i]) {
        results.push(renderRow(i, {
          height: `${rowHeight}px`,
          position: 'absolute',
          left: 0,
          transform: `translate3d(0, ${i * rowOffsetHeight}px, 0)`,
          width: '100%',
          marginBottom: `${gap}px`,
          ...renderStyle,
        }))
      }
    }
    return results
  }, [startIndex, endIndex, renderRow, rowHeight, rowOffsetHeight, gap, renderStyle, dataSource])

  useEffect(() => {
    rowOffsetHeightRef.current = rowOffsetHeight
  }, [rowOffsetHeight])

  useEffect(() => {
    if (typeof scrollTo?.to === 'number') {
      (scrollRef.current as HTMLDivElement).scrollTop = scrollTo.to * rowOffsetHeightRef.current
    }
  }, [scrollTo])
  useEffect(() => {
    onIndexChange && onIndexChange([startIndex, endIndex])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource])

  return (
    <div
      className={wraperClassName}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        scrollBehavior: 'smooth',
        ...wraperStyle,
      }}
      ref={scrollRef}
      onScroll={onScroll}
    >
      <div
        className={scrollClassName}
        style={{
          height: `${count * rowOffsetHeight - gap}px`,
          width: '100%',
          position: 'relative',
          ...scrollStyle,
        }}
      >
        {
          renderRows()
        }
      </div>
    </div>
  )
}
