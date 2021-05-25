import { ReactElement, ReactFragment, CSSProperties } from 'react'
import { StoreValue } from 'rc-field-form/es/interface'
import { HierarchyPointNode } from 'd3-hierarchy'
import { Rule } from 'rc-field-form/lib/interface';

export interface ValueProps {
  relation: StoreValue
  children: StoreValue
  [key: string]: StoreValue
}
export interface RootNodeType extends ValueProps {
  type: string
  path: (string | number)[]
}

export interface ChildNodeType extends RootNodeType {
  type: string
  key: string
  index: number
  parentPath: string[]
  path: (string | number)[]
}

export interface ActionNodeType {
  index: number
  type: string
  key: string
  parentPath: (string | number)[]
  level: number
}

export interface Relation {
  text: string
  value: string | number
}
export interface FieldProps {
  id: string
  rules?: Rule[]
  element?: ReactElement
  render?: (ctx: DepContext) => ReactElement
}
export interface RuleTreeProps {
  fields: FieldProps[]
  value?: ValueProps
  onChange?: (value: ValueProps) => void
  relations: Relation[]
  rootRelations: Relation[]
  cascades?: (string | number)[]
  onCascade?: (ctx: CascadesContext) => void
  disabled?: boolean
  style?: CSSProperties
  className?: string
  canRootChange?: boolean
  deleteIcon?: JSX.Element | ((node: HierarchyPointNode<ChildNodeType>) => JSX.Element)
  canDelete?: boolean | 'disabled' | ((node: HierarchyPointNode<ChildNodeType>) => boolean | 'disabled')
  dragIcon?:JSX.Element | ((node: HierarchyPointNode<ChildNodeType>) => JSX.Element)
  canDrag?: boolean | 'disabled' | ((node: HierarchyPointNode<ChildNodeType>) => boolean | 'disabled')
  canAddCondition?: boolean | 'disabled' | ((data: ActionNodeType) => boolean | 'disabled')
  canAddConditionGroup?: boolean | 'disabled' | ((data: ActionNodeType) => boolean | 'disabled')
  addConditionIcon?: JSX.Element | ((node: ActionNodeType) => JSX.Element)
  addConditionGroupIcon?: JSX.Element | ((node: ActionNodeType) => JSX.Element)
}

export interface CascadesContext {
  id: string | number
  key: string
  value: StoreValue
  record: any
}

export interface DepContext extends CascadesContext {
  index: number
}

export interface DragItem {
  x: number
  y: number
  data: ChildNodeType
}
export interface DropProps {
  canDrag: boolean
  data: ChildNodeType
  node: HierarchyPointNode<RootNodeType>
  onDrop: (drop: DropProps, drag: DragProps) => void
  x: number
  y: number
  connectDropTarget?: (target: HTMLDivElement) => ReactElement
  isOver?: boolean
  canDrop?: boolean
  type: string
}
export interface DragProps {
  children: ReactFragment
  data: RootNodeType
  node: HierarchyPointNode<RootNodeType>
  x: number
  y: number
  isDragging?: boolean
  dragIcon?: JSX.Element | ((node: HierarchyPointNode<ChildNodeType>) => JSX.Element)
  canDrag?: boolean | 'disabled' | ((node: HierarchyPointNode<ChildNodeType>) => boolean | 'disabled')
  connectDragSource?: (source: ReactElement) => ReactElement
  connectDragPreview?: (preview: ReactElement) => ReactElement
  type: string
}
export interface LinkProps {
  source: {
    x: number
    y: number
  }
  target: {
    x: number
    y: number
  }
  highlight?: boolean
}
