import React from 'react'
import { DragProps } from './index.d'
import { DragSource } from 'react-dnd'
import { ALIGN_CENTER, FLEX_ALIGN_CENTER, COMPONENT_HEIGHT, ICON_COLOR } from './constants'
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
    dragIcon,
    canDrag
  } = ref
  const opacity = isDragging ? 0.4 : 1
  const dragHandler = (
    <span style={{...handleStyle, cursor: canDrag === 'disabled' ? 'not-allowed' : 'move'}}>
      {
        React.isValidElement(dragIcon) ? dragIcon : (
          <DragOutlined style={{ color: ICON_COLOR }} />
        )
      }
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
      className='undrag'
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
    canDrag(props, monitor) {
      return props.canDrag !== 'disabled'
    }
  },
  (connect, monitor) => {
    return {
      connectDragSource: connect.dragSource(),
      connectDragPreview: connect.dragPreview(),
      isDragging: monitor.isDragging(),
    }
  },
)(Drag)
