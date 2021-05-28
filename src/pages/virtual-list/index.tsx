import React, { CSSProperties, useCallback, useRef, useState } from 'react'
import {  } from 'antd'

const rowHeight = 80
const height = 500
const count = 10000
const buffers = 5
const limit = Math.ceil(height / rowHeight)

const renderRow = (index: number, style: CSSProperties) => (
  <div key={index} style={style}>item-{index}</div>
)

export default function VirtualList() {
  const scrollRef = useRef(null)
  const [originStartIndex, setOriginStartIndex] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [endIndex, setEndIndex] = useState(() => {
    return Math.min(startIndex + limit + buffers, count - 1)
  })

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if(scrollRef?.current === e.target) {
      const { scrollTop } = e.target
      const index = Math.floor(scrollTop / rowHeight)
      if(originStartIndex !== index) {
        setOriginStartIndex(index)
        setStartIndex(Math.max(index - buffers, 0))
        setEndIndex(Math.min(index + limit + buffers, count - 1))
      }
    }
  }, [originStartIndex])

  const renderRows = useCallback(() => {
    const results: JSX.Element[] = []
    for(let i = startIndex; i <= endIndex; i++) {
      results.push(renderRow(i, {
        height: `${rowHeight}px`,
        lineHeight: `${rowHeight}px`,
        position: 'absolute',
        left: 0,
        top: `${i * rowHeight}px`,
        width: '100%',
        borderBottom: '1px solid red',
        padding: '0 10px'
      }))
    }
    return results
  }, [startIndex, endIndex])

  return (
    <div
      style={{
        height: `${height}px`,
        overflow: 'auto',
        width: '300px',
        border: '1px solid #ccc',
        margin: '10px',
        background: '#fff'
      }}
      ref={scrollRef}
      onScroll={onScroll}
    >
      <div
        style={{
          height: `${count * rowHeight}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {
          renderRows()
        }
      </div>
    </div>
  )
}