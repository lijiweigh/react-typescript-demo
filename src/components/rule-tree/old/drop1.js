import _extends from "@babel/runtime/helpers/extends";
import React from 'react';
import { DropTarget } from 'react-dnd';
import Link from '../es/link';
import constants from '../es/constants';
const COMPONENT_SPACE_VERTICAL = constants.COMPONENT_SPACE_VERTICAL, COMPONENT_SPACE_HORIZONTAL = constants.COMPONENT_SPACE_HORIZONTAL, RELATION_WIDTH = constants.RELATION_WIDTH, COMPONENT_HEIGHT = constants.COMPONENT_HEIGHT;
const innerStyle = {
  width: RELATION_WIDTH,
  height: COMPONENT_SPACE_VERTICAL
};

const Drop = function Drop(_ref) {
  const canDrop = _ref.canDrop, isOver = _ref.isOver, connectDropTarget = _ref.connectDropTarget, x = _ref.x, y = _ref.y, canDrag = _ref.canDrag, node = _ref.node;
  const clsNames = `${canDrop ? 'drop-area' : ''} ${canDrop && isOver ? 'drop-area-can-drop' : ''}`;
  const parent = node.parent;
  let x0;

  if (!parent.parent) {
    x0 = parent.y + RELATION_WIDTH;
  } else {
    x0 = parent.y + RELATION_WIDTH + (canDrag ? COMPONENT_SPACE_HORIZONTAL : 0);
  }

  return (
    <React.Fragment>
      <div
        ref={connectDropTarget}
        className={clsNames}
        style={_extends({}, innerStyle, {
          position: 'absolute',
          left: x,
          top: y
        })} />
      {canDrop && <Link
        highlight={true}
        source={{
          x: x0,
          y: parent.x
        }}
        target={{
          x,
          y: y + COMPONENT_SPACE_VERTICAL / 2 - COMPONENT_HEIGHT / 2
        }} />}
    </React.Fragment>
  );
};

export default DropTarget(_ref2 => {
  const type = _ref2.type;
  return type;
}, {
  canDrop: function canDrop(drop, monitor) {
    const drag = monitor.getItem(); // 根节点不能放到子树中

    let depthDiff = drop.node.depth - drag.node.depth;

    if (depthDiff > 0) {
      let p = drop.node; // eslint-disable-next-line

      while (depthDiff--) {
        p = p.parent;
      }

      if (p === drag.node) {
        return false;
      }
    }

    const cannot = drag.data.parentPath === drop.data.parentPath && (drag.data.index === drop.data.index || drag.data.index + 1 === drop.data.index);
    return !cannot;
  },
  drop: function drop(props, monitor) {
    const item = monitor.getItem();
    props.onDrop(props, item);
    return props;
  }
}, (connect, monitor) => {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
})(Drop);