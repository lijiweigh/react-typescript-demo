import React from 'react'
import { DragProps } from './index.d'
import { DragSource } from 'react-dnd'
import { ALIGN_CENTER, FLEX_ALIGN_CENTER, COMPONENT_HEIGHT } from './constants'
import { DragOutlined } from '@ant-design/icons'

const handleStyle = {
  cursor: 'move',
  marginRight: 6,
  ...ALIGN_CENTER,
  ...FLEX_ALIGN_CENTER
}

const Drag = function Drag(ref: any) {
  const {
    isDragging,
    connectDragSource,
    connectDragPreview,
    x,
    y,
    children,
  } = ref
  const opacity = isDragging ? 0.4 : 1
  const dragHandler = (
    <span style={handleStyle}>
      <DragOutlined style={{ color: '#c7d0d9' }} />
    </span>
  )
  return connectDragPreview(
    <div
      style={{
        opacity,
        left: x,
        top: y,
        height: COMPONENT_HEIGHT,
        ...FLEX_ALIGN_CENTER
      }}
      className='drag'
    >
      {connectDragSource(dragHandler)}
      <span
        style={{
          ...ALIGN_CENTER,
          ...FLEX_ALIGN_CENTER
        }}
      >
        {children}
      </span>
    </div>,
  )
}

export const UnDrag = function UnDrag(ref: DragProps) {
  const children = ref.children,
    x = ref.x,
    y = ref.y
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        ...ALIGN_CENTER,
      }}
    >
      {children}
    </div>
  )
}

export default DragSource(
  (ref: any) => {
    const type = ref.type
    return type
  },
  {
    beginDrag: function beginDrag(props) {
      return props
    },
  },
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    }
  },
)(Drag)
