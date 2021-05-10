// @ts-nocheck
import _extends from "@babel/runtime/helpers/extends";
import React from 'react';
import { DragProps } from './interface';
import { DragSource } from 'react-dnd';
import constants from './constants';
import GovIcon from '@aligov/icon';

const ALIGN_CENTER = constants.ALIGN_CENTER;

const handleStyle = _extends({
  cursor: 'move',
  marginRight: 6
}, ALIGN_CENTER);

const Drag = function Drag(_ref) {
  const isDragging = _ref.isDragging, connectDragSource = _ref.connectDragSource, connectDragPreview = _ref.connectDragPreview, x = _ref.x, y = _ref.y, children = _ref.children;
  const opacity = isDragging ? 0.4 : 1;
  const dragHandler = <span style={handleStyle}>
    <GovIcon className="icon" custom={true} type="tuodong" />
  </span>;
  return connectDragPreview( <div
    style={{
      opacity,
      left: x,
      top: y
    }}
    className="drag">
    {connectDragSource(dragHandler)}
    <span
      style={_extends({
        display: 'flex'
      }, ALIGN_CENTER)}>
      {children}
    </span>
  </div>);
};

export default DragSource(_ref2 => {
  const type = _ref2.type;
  return type;
}, {
  beginDrag: function beginDrag(props) {
    return props;
  }
}, (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  };
})(Drag);

export const UnDrag = function UnDrag(_ref3) {
  const children = _ref3.children, x = _ref3.x, y = _ref3.y;
  return (
    <div
      style={_extends({
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex'
      }, ALIGN_CENTER)}>
      {children}
    </div>
  );
};
