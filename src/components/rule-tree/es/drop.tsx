import React from 'react'
import { DropTarget } from 'react-dnd'
import Link from './link'
import {
  COMPONENT_SPACE_VERTICAL,
  EXTRA_MOVE_ICON_WIDTH,
  RELATION_WIDTH,
  COMPONENT_HEIGHT,
} from './constants'

const innerStyle = {
  width: RELATION_WIDTH,
  height: COMPONENT_SPACE_VERTICAL,
}

const Drop = function Drop(ref: any) {
  const {
    canDrop,
    isOver,
    connectDropTarget,
    x,
    y,
    canDrag,
    node,
  } = ref
  const clsNames = `${canDrop ? 'drop-area' : ''} ${canDrop && isOver ? 'drop-area-can-drop' : ''}`
  const parent = node.parent
  let x0

  if (!parent.parent) {
    x0 = parent.y + RELATION_WIDTH
  } else {
    x0 = parent.y + RELATION_WIDTH + (canDrag ? EXTRA_MOVE_ICON_WIDTH : 0)
  }

  return (
    <React.Fragment>
      <div
        ref={connectDropTarget}
        className={clsNames}
        style={{
          ...innerStyle,
          position: 'absolute',
          left: x,
          top: y,
        }}
      />
      {canDrop && (
        <Link
          highlight={true}
          source={{
            x: x0,
            y: parent.x,
          }}
          target={{
            x,
            y: y + COMPONENT_SPACE_VERTICAL / 2 - COMPONENT_HEIGHT / 2,
          }}
        />
      )}
    </React.Fragment>
  )
}

export default DropTarget(
  (ref: any) => {
    const type = ref.type
    return type
  },
  {
    canDrop: function canDrop(drop, monitor) {
      const drag = monitor.getItem() // 根节点不能放到子树中

      let depthDiff = drop.node.depth - drag.node.depth

      if (depthDiff > 0) {
        let p = drop.node

        while (depthDiff--) {
          p = p.parent
        }

        if (p === drag.node) {
          return false
        }
      }

      const cannot =
        drag.data.parentPath === drop.data.parentPath &&
        (drag.data.index === drop.data.index || drag.data.index + 1 === drop.data.index)
      return !cannot
    },
    drop: function drop(props, monitor) {
      const item = monitor.getItem()
      props.onDrop(props, item)
      return props
    },
  },
  (connect, monitor) => {
    return {
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }
  },
)(Drop)
