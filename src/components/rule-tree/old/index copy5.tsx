// @ts-nocheck
import {
  RuleTreeProps,
  DragProps,
  DropProps,
  ValueProps,
  RootNodeType,
  ChildNodeType,
  ActionNodeType,
  FieldProps,
} from '../es'
import { Button, Select, Tooltip, Form as AntdForm } from 'antd'
import { DeleteOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons'
import React from 'react'
import Form, { Field, FormInstance } from 'rc-field-form'
import { hierarchy, HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy'
import { DndProvider, createDndContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { isObject, isArray, isUndefined, assign, get, set, cloneDeep } from 'lodash-es'
import Drag, { UnDrag } from '../es/drag'
import Drop from '../es/drop'
import Link from '../es/link'
import {
  RELATIONS,
  NodeType,
  COMPONENT_HEIGHT,
  COMPONENT_SPACE_HORIZONTAL,
  COMPONENT_SPACE_VERTICAL,
  COMPONENT_MARGIN,
  RELATION_WIDTH,
  ALIGN_CENTER,
  FLEX_ALIGN_CENTER,
  EXTRA_MOVE_ICON_WIDTH,
  RELATION_HEIGHT,
  ICON_COLOR,
  ACTION_HEIGHT,
} from '../es/constants'
import './index.less'

const { ACTION, RELATION, LEAF, DROP } = NodeType

const FormItem = AntdForm.Item

function getHierarchyId(...args: string[]) {
  let len = args.length,
    ids = new Array(len),
    key = 0
  for (; key < len; key++) {
    ids[key] = args[key]
  }

  return ids.join('.')
}
// 找到嵌套的最后一个子节点
function findLastChild(
  parent: HierarchyPointNode<ChildNodeType>,
): HierarchyPointNode<ChildNodeType> {
  const child = parent.children![parent.children!.length - 1]
  if (child.children) {
    return findLastChild(child)
  } else {
    return child
  }
}

let gIndex = 0

const DndContext = createDndContext(HTML5Backend)

const alwaysTrue = function alwaysTrue() {
  return true
}

const alwaysFalse = function alwaysTrue() {
  return false
}

export default class RuleTree extends React.Component<RuleTreeProps> {
  form: FormInstance | undefined
  dndType: string
  key: number
  value: ValueProps
  inited: boolean
  pathByKey: any
  static defaultProps: {
    rootRelations: { value: string; text: string }[]
    relations: { value: string; text: string }[]
    canAddCondition: () => boolean
    canAddConditionGroup: () => boolean
    addConditionDisabled: () => boolean
    addConditionGroupDisabled: () => boolean
  }
  constructor(props: RuleTreeProps) {
    super(props)
    this.key = 0
    this.inited = false
    // 不知道干嘛用
    this.pathByKey = Object.create(null)

    this.dndType = `dndType-${gIndex}`
    gIndex += 1
    let defaultValue = {
      children: [{}],
      relation: props.rootRelations[0].value,
    }

    if (!isUndefined(props.value)) {
      this.inited = true
      defaultValue = cloneDeep(props.value)
    }

    this.value = defaultValue
    return this
  }

  getDragResult = (node: HierarchyPointNode<ChildNodeType> | HierarchyPointLink<ChildNodeType>) => {
    const { dragIcon, canDrag, disabled } = this.props
    let notDrag = disabled || dragIcon === false || canDrag === false
    if(typeof canDrag === 'function') {
      notDrag = !canDrag(node)
    }
    const DragItem = notDrag ? UnDrag : Drag
    return {
      notDrag,
      DragItem
    }
  }

  // 添加条件
  handleAddCondition = (data: ActionNodeType) => {
    const children = get(this.value, data.parentPath)
    children.push({})
    this.onChange(this.value)
  }
  // 添加条件组
  handleAddGroup = (data: ActionNodeType) => {
    const children = get(this.value, data.parentPath)
    children.push({
      children: [{}],
      relation: get(this.props.relations, '0.value'),
    })

    this.onChange(this.value)
  }

  handleDrop = (dropProps: DropProps, dragProps: DragProps) => {
    const parent = get(this.value, dragProps.data.parentPath)
    const dropParent = get(this.value, dropProps.data.parentPath) // 删掉

    const dragItem = parent.splice(dragProps.data.index, 1)[0] // 添加

    dropParent.splice(dropProps.data.index, 0, dragItem)

    this.onChange(this.value)
  }

  onValuesChange = (changedValues: any, allValues: any) => {
    this.value = allValues

    const namePath = this.getNamePath(changedValues)
    const { cascades, onCascade } = this.props
    const lastIndex = namePath.length - 1
    const id = namePath[lastIndex]
    const path = namePath.slice(0, lastIndex)

    if (onCascade && cascades && cascades.indexOf(id) > -1) {
      const ctx = {
        id,
        key: get(allValues, [...path, 'key']),
        value: this.form!.getFieldValue(namePath),
        record: get(this.value, path),
      }
      onCascade(ctx)
    }

    this.onChange(this.value)
  }

  getUniqKey(key: number, keyMap: any): number {
    if (key in keyMap) {
      const k = key + 1
      return this.getUniqKey(k, keyMap)
    }

    return key
  }
  setKey(value: ValueProps, keyMap: any): void {
    const createKey = (v: ValueProps | number) => {
      if (isUndefined((v as ValueProps).key)) {
        ;(v as ValueProps).key = this.getUniqKey(this.key, keyMap)
      } else {
        ;(v as ValueProps).key = this.getUniqKey((v as ValueProps).key, keyMap)
      }

      keyMap[(v as ValueProps).key] = 1

      if ((v as ValueProps).children) {
        this.setKey((v as ValueProps).children, keyMap)
      }
    }

    if (isArray(value)) {
      value.forEach((v) => {
        createKey(v)
      })
    } else {
      createKey(value)
    }
  }
  addOperation(children: any[], parentPath: (string | number)[], level: number, disabled?: boolean) {
    const { canAddCondition, canAddConditionGroup } = this.props
    if (children === undefined) {
      children = []
    }

    const result: (ChildNodeType | ActionNodeType)[] = []

    if (children.length) {
      children.forEach((child, index) => {
        const path: (string | number)[] = [...parentPath, index]
        const key = child.key
        const node: ChildNodeType = {
          ...child,
          type: LEAF,
          key,
          index,
          parentPath,
          path,
        }

        if (child.children) {
          // 关系节点
          node.type = RELATION
          node.children = this.addOperation(
            child.children,
            [...path, 'children'],
            level + 1,
            disabled,
          )
          path.push('relation')
        }

        result.push(node)
      })
    }

    if (!disabled) {
      const data = {
        index: children.length,
        type: ACTION,
        key: `action-${parentPath.join('-')}`,
        parentPath,
        level: level + 1,
      }
      if (canAddCondition(data) || canAddConditionGroup(data)) {
        result.push(data)
      } else {
        result.push({...data, type: DROP})
      }
    }

    return result
  }
  buildNodes(
    root: HierarchyPointNode<ChildNodeType>,
    disabled?: boolean,
  ): {
    nodes: HierarchyPointNode<ChildNodeType>
    height: number
  } {
    let leafCount = 0 // 画布高度

    let height = 0

    const nodes = root.eachAfter((d) => {
      const { notDrag } = this.getDragResult(d)
      console.log(notDrag)
      d.y =
        //        关系节点的宽度 + 水平两个节点的距离 + 可以拖动时拖动按钮额外产生的宽度
        d.depth *
        (RELATION_WIDTH + COMPONENT_SPACE_HORIZONTAL + (notDrag ? 0 : EXTRA_MOVE_ICON_WIDTH))
      // 根节点不能拖动，所以减去一个 EXTRA_MOVE_ICON_WIDTH
      if (!notDrag && d.depth > 0) {
        d.y -= EXTRA_MOVE_ICON_WIDTH
      }

      if (d.data.type !== RELATION) {
        d.x = leafCount * (COMPONENT_HEIGHT + COMPONENT_SPACE_VERTICAL)
        leafCount += 1
      } else {
        d.x =
          d.children && d.children.length
            ? (d.children[0].x + d.children[d.children.length - 1].x) / 2
            : 0
        // 根节点 后序遍历结束，开始设置整个规则树的高度
        if (!d.parent) {
          // 最下面的节点的x + 节点高度
          const lastNode = findLastChild(d)
          console.log(lastNode)
          height = lastNode.x + (lastNode.data.type === DROP ? 0 : COMPONENT_HEIGHT)
        }
      }
    })

    return {
      nodes,
      height,
    }
  }

  createFields(nodes: HierarchyPointNode<ChildNodeType>[], disabled?: boolean) {
    const { fields, relations, rootRelations, canRootChange, dragIcon, canDrag } = this.props
    const value = this.value
    const result: JSX.Element[] = []
    // let DragItem = (disabled || dragIcon === false || canDrag === false) ? UnDrag : Drag
    nodes.forEach((node, nindex) => {
      // if(typeof canDrag === 'function') {
      //   DragItem = canDrag(node) ? Drag : UnDrag
      // }
      const { DragItem } = this.getDragResult(node)
      const { data, x, y, parent } = node
      const { type, key, index, path } = data as ChildNodeType

      if (!parent) {
        // root 节点
        const initialValue = get(value, 'relation') || get(rootRelations, '0.value')
        const fieldElm = (
          <Field name={path} key='root'>
            {canRootChange ? (
              <Select
                disabled={disabled}
                style={{
                  width: RELATION_WIDTH,
                  height: RELATION_HEIGHT,
                  minWidth: RELATION_WIDTH,
                  position: 'absolute',
                  left: y,
                  top: x + (COMPONENT_HEIGHT - RELATION_HEIGHT) / 2,
                }}
              >
                {rootRelations.map((relation) => {
                  return (
                    <Select.Option value={relation.value} key={relation.value}>
                      {relation.text}
                    </Select.Option>
                  )
                })}
              </Select>
            ) : (
              <Button
                style={{
                  width: RELATION_WIDTH,
                  height: RELATION_HEIGHT,
                  minWidth: RELATION_WIDTH,
                  position: 'absolute',
                  left: y,
                  top: x + (COMPONENT_HEIGHT - RELATION_HEIGHT) / 2,
                }}
              >
                {rootRelations[0].text}
              </Button>
            )}
          </Field>
        )
        set(this.value, path, initialValue)
        result.push(fieldElm)
      } else {
        // 非root节点，关系节点/叶子节点/action节点/drop节点
        if (!disabled) {
          // drop
          const dropX =
            index === 0
              ? x - COMPONENT_SPACE_VERTICAL
              : x - (x - (nodes[nindex - 1].x + COMPONENT_HEIGHT) + COMPONENT_SPACE_VERTICAL) / 2

          const dropEle = (
            <Drop
              x={y}
              y={dropX}
              node={node}
              data={data}
              onDrop={this.handleDrop}
              disabled={disabled}
              type={this.dndType}
              key={getHierarchyId(key, 'drop')}
            />
          )

          result.push(dropEle)
        }

        let ele

        if (type === RELATION) {
          // 关系节点
          ele = (
            <DragItem
              x={y}
              y={x}
              node={node}
              data={data}
              type={this.dndType}
              dragIcon={dragIcon}
              key={getHierarchyId(key, 'relation')}
            >
              {
                <Field name={path}>
                  {(control) => {
                    return (
                      <FormItem
                        style={{
                          marginBottom: 0,
                          ...FLEX_ALIGN_CENTER,
                        }}
                      >
                        {
                          <Select
                            {...{
                              disabled: disabled,
                              style: {
                                width: RELATION_WIDTH,
                                minWidth: RELATION_WIDTH,
                              },
                              ...control,
                            }}
                          >
                            {relations.map((relation) => {
                              return (
                                <Select.Option value={relation.value} key={relation.value}>
                                  {relation.text}
                                </Select.Option>
                              )
                            })}
                          </Select>
                        }
                      </FormItem>
                    )
                  }}
                </Field>
              }
            </DragItem>
          )
        } else if (type === LEAF) {
          const { deleteIcon } = this.props
          // 叶子节点
          ele = (
            <DragItem
              x={y}
              y={x}
              data={data}
              node={node}
              type={this.dndType}
              dragIcon={dragIcon}
              key={getHierarchyId(key, 'leaf')}
            >
              {fields.map((field: FieldProps, i: number) => {
                return this.renderField(field, i, path, key, disabled)
              })}
              {!disabled && deleteIcon !== false &&  (
                <span
                  style={{
                    marginLeft: COMPONENT_MARGIN,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    return this.handleDelete(data, node)
                  }}
                >
                  {
                    deleteIcon ? deleteIcon : (
                      <DeleteOutlined
                        style={{
                          color: ICON_COLOR,
                          ...ALIGN_CENTER,
                          ...FLEX_ALIGN_CENTER,
                        }}
                      />
                    )
                  }
                </span>
              )}
            </DragItem>
          )
        } else if(type === ACTION) {
          // action节点
          ele = (
            <div
              style={{
                position: 'absolute',
                left: y,
                top: x,
              }}
              key={getHierarchyId(key, 'action')}
            >
              {this.renderActions((data as unknown) as ActionNodeType)}
            </div>
          )
        }

        ele && result.push(ele)
      }
    })
    return result
  }

  /**
   * 渲染field
   */
  renderField(
    field: FieldProps,
    index: number,
    path: (string | number)[],
    key: any,
    disabled?: boolean
  ): JSX.Element {
    const { id, rules, render } = field
    const namePath = [...path, id]
    let element
    return (
      <Field name={namePath} key={getHierarchyId(key, id)} rules={rules}>
        {(control, meta, form) => {
          if (render) {
            const ctx = {
              id,
              key,
              value: control.value,
              record: get(this.value, path),
              index,
            }
            element = render(ctx)
          } else {
            element = field.element
          }

          const validateState = (meta.errors || []).length > 0 ? 'error' : undefined
          const help = (meta.errors || []).length > 0 ? meta.errors[0] : undefined
          const childElement = React.cloneElement(element as any, {
            disabled: element!.props.disabled || disabled,
            ...control,
          })
          return (
            <FormItem
              style={{
                marginLeft: index ? COMPONENT_MARGIN : 0,
                marginBottom: 0,
                ...FLEX_ALIGN_CENTER,
              }}
              help={help}
              validateStatus={validateState}
            >
              {childElement}
            </FormItem>
          )
        }}
      </Field>
    )
  }

  renderActions = (data: ActionNodeType) => {
    console.log('renderActions', cloneDeep(data))
    const {
      addConditionDisabled,
      addConditionGroupDisabled,
      canAddCondition,
      canAddConditionGroup,
    } = this.props

    const finalCanAddCondition = canAddCondition(data)
    const finalCanAddConditionGroup = canAddConditionGroup(data)
    const finalAddConditionDisabled = addConditionDisabled(data)
    const finalAddConditionGroupDisabled = addConditionGroupDisabled(data)
    return (
      <div
        className='actions'
        style={{
          height: `${ACTION_HEIGHT}px`,
          marginTop: `${(COMPONENT_HEIGHT - ACTION_HEIGHT) / 2}px`,
        }}
      >
        {finalCanAddCondition && (
          <Tooltip title='添加条件'>
            <span
              style={{
                cursor: finalAddConditionDisabled ? 'not-allowed' : 'pointer',
                borderRight: '1px dashed ' + ICON_COLOR,
                height: '100%',
                ...FLEX_ALIGN_CENTER,
              }}
              onClick={() => {
                return !finalAddConditionDisabled && this.handleAddCondition(data)
              }}
            >
              <PlusOutlined
                style={{
                  color: ICON_COLOR,
                  padding: '0 8px',
                }}
              />
            </span>
          </Tooltip>
        )}
        {finalCanAddConditionGroup && (
          <Tooltip title='添加条件组'>
            <span
              style={{
                height: '100%',
                cursor: finalAddConditionGroupDisabled ? 'not-allowed' : 'pointer',
                ...FLEX_ALIGN_CENTER,
              }}
              onClick={() => {
                return !finalAddConditionGroupDisabled && this.handleAddGroup(data)
              }}
            >
              <PlusSquareOutlined
                style={{
                  color: ICON_COLOR,
                  padding: '0 8px',
                  fontSize: '15px',
                }}
              />
            </span>
          </Tooltip>
        )}
      </div>
    )
  }

  createLinks(links: HierarchyPointLink<ChildNodeType>[], disabled?: boolean) {
    const { dragIcon, canDrag } = this.props
    return links.map((link) => {
      const source = link.source,
        target = link.target
      const sourceKey = source.data.key
      const targetKey = target.data.key
      let x

      if (!source.parent) {
        x = source.y + RELATION_WIDTH
      } else {
        // let notDrag = disabled || dragIcon === false || canDrag === false
        // if(typeof canDrag === 'function') {
        //   notDrag = !canDrag(link)
        // }
        const { notDrag } = this.getDragResult(link)
        console.log(notDrag)
        x = source.y + RELATION_WIDTH + (notDrag ? 0 : COMPONENT_SPACE_HORIZONTAL)
      }

      return (
        <Link
          key={getHierarchyId(sourceKey, targetKey)}
          source={{
            x,
            y: source.x,
          }}
          target={{
            x: target.y,
            y: target.x,
          }}
        />
      )
    })
  }

  handleDelete = (data: ChildNodeType, node: HierarchyPointNode<ChildNodeType>) => {
    const length = node.parent!.children!.length
    const lastNodeIsAction = node.parent!.children![length - 1].data.type === ACTION
    if (length === 1 || (length === 2 && lastNodeIsAction)) {
      this.handleDeleteSingleGroup(node)
    } else {
      const deleteParent = get(this.value, data.parentPath)
      deleteParent.splice(data.index, 1)

      this.onChange(this.value)
    }
  }

  handleDeleteSingleGroup(node: HierarchyPointNode<ChildNodeType>) {
    if (!node.parent || !node.parent.children) {
      return
    }
    const length = node.parent!.children!.length
    const lastNodeIsAction = node.parent!.children![length - 1].data.type === ACTION
    if (length === 1 || (length === 2 && lastNodeIsAction)) {
      const parent = node.parent
      this.handleDeleteGroup(node)
      this.handleDeleteSingleGroup(parent)
    }
  }

  handleDeleteGroup = (node: HierarchyPointNode<ChildNodeType>) => {
    const deleteParent = node.parent as HierarchyPointNode<ChildNodeType>
    const deleteGrandPa = deleteParent.parent

    if (!deleteGrandPa) {
      // root
      this.value.children = []
    } else if (!deleteGrandPa.data.parentPath) {
      // grandpa是root
      this.value.children.splice(deleteParent.data.index, 1)
    } else {
      const dp = get(this.value, deleteParent.data.parentPath)
      dp.splice(deleteParent.data.index, 1)
    }

    this.onChange(this.value)
  }

  getNamePath(changedValues: any) {
    const namePath: (string | number)[] = []

    const fillNamePath = (value: any) => {
      if (isArray(value)) {
        value.forEach((v, i) => {
          if (!isUndefined(v)) {
            namePath.push(i)
            fillNamePath(v)
          }
        })
      } else if (isObject(value)) {
        const key = Object.keys(value)[0]
        namePath.push(key)

        if (key === 'children') {
          // children
          fillNamePath((value as ValueProps)[key])
        }
      }
    }

    fillNamePath(changedValues)
    return namePath
  }

  componentDidUpdate() {
    // 设置表单项的值
    this.form!.setFieldsValue(this.value)
  }

  onChange(value: any) {
    this.form!.setFieldsValue(value)
    const onChange = this.props.onChange
    // 强制 React 重新渲染
    this.setState({})
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    const { style, disabled, onChange } = this.props
    const className = this.props.className === undefined ? '' : this.props.className
    // 作为受控组件使用的话，将value更新为props的value
    if (onChange && this.props.value) {
      this.inited = true
      this.value = cloneDeep(this.props.value)
    }
    this.setKey(this.value, {})
    const rootNodeValue: RootNodeType = assign(
      {
        type: RELATION,
        path: ['relation'],
      },
      this.value,
    )
    // 添加【添加条件、添加条件组】
    rootNodeValue.children = this.addOperation(this.value.children, ['children'], 0, disabled)
    const root = hierarchy(rootNodeValue) as HierarchyPointNode<ChildNodeType>
    console.log('root', cloneDeep(root))
    // 设置每个节点的位置，和组件的高度
    const { nodes, height } = this.buildNodes(root, disabled)
    console.log('nodes', nodes)
    const flattenNodes = nodes.descendants()
    const flattenLinks = nodes.links()
    console.log('flattenLinks', cloneDeep(flattenLinks))
    // 与 form 结合
    const fields = this.createFields(flattenNodes, disabled)
    // 设置节点间的连线
    const links = this.createLinks(flattenLinks.filter(link => link.target.data.type !== DROP), disabled)
    return (
      <DndProvider manager={DndContext.dragDropManager}>
        {
          <div
            className={`ruleTreeContainer ${className}`}
            style={assign({
              height,
              style,
            })}
          >
            {
              <Form
                component='div'
                ref={(ref) => {
                  ref && (this.form = ref)
                }}
                onValuesChange={this.onValuesChange}
                initialValues={this.value}
              >
                {fields}
              </Form>
            }
            {links}
          </div>
        }
      </DndProvider>
    )
  }
}

RuleTree.defaultProps = {
  rootRelations: RELATIONS,
  relations: RELATIONS,
  canAddCondition: alwaysTrue,
  canAddConditionGroup: alwaysTrue,
  addConditionDisabled: alwaysFalse,
  addConditionGroupDisabled: alwaysFalse,
}
