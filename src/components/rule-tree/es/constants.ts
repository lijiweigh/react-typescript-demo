export enum NodeType {
  RELATION = 'relation',
  LEAF = 'leaf',
  ACTION = 'action',
}
// 关系节点宽度
export const RELATION_WIDTH = 80
// 关系节点高度
export const RELATION_HEIGHT = 32
// 添加按钮高度
export const ACTION_HEIGHT = 32
// 内容节点高度
export const COMPONENT_HEIGHT = 40
// 两个相邻子节点的垂直距离，以及拖动时可放置的拖动阴影的高度
export const COMPONENT_SPACE_VERTICAL = 16
// 两个相邻子节点的水平距离
export const COMPONENT_SPACE_HORIZONTAL = 38
// 当允许拖动时，拖动按钮产生的额外宽度
export const EXTRA_MOVE_ICON_WIDTH = 36
// 14 + 8(margin-right) + 8(padding) + 2
// 子节点内各个元素直接的距离
export const COMPONENT_MARGIN = 10
export const ICON_COLOR = '#c7d0d9'
export const ALIGN_CENTER = {
  height: COMPONENT_HEIGHT,
  lineHeight: `${COMPONENT_HEIGHT}px`,
}
export const FLEX_ALIGN_CENTER = {
  display: 'flex',
  alignItems: 'center',
}
export const RELATIONS = [
  {
    value: 'and',
    text: 'And',
  },
  {
    value: 'or',
    text: 'Or',
  },
]
