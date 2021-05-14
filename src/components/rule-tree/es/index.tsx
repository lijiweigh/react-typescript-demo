import {
  RuleTreeProps,
  DragProps,
  DropProps,
  ValueProps,
  RootNodeType,
  ChildNodeType,
  ActionNodeType,
  FieldProps,
} from './index.d'
import { Button, Select, Tooltip, Form as AntdForm } from 'antd'
import { DeleteOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons'
import React from 'react'
import Form, { Field, FormInstance } from 'rc-field-form'
import { hierarchy, HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy'
import { DndProvider, createDndContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { isObject, isArray, isUndefined, assign, get, set, cloneDeep } from 'lodash-es'
import Drag, { UnDrag } from './drag'
import Drop from './drop'
import Link from './link'
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
  ACTION_HEIGHT
} from './constants'
import './index.less'

const {
  ACTION,
  RELATION,
  LEAF,
} = NodeType

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
function findLastChild(parent: HierarchyPointNode<ChildNodeType>): HierarchyPointNode<ChildNodeType> {
  const child = parent.children![parent.children!.length - 1]
  if(child.children) {
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

export default class RuleTree extends React.Component<RuleTreeProps, { value: ValueProps }> {
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

  // 添加条件
  handleAddCondition = (data: ChildNodeType) => {
    console.log('handleAddCondition', cloneDeep(data))
    const children = get(this.value, data.parentPath)
    children.push({})
    this.onChange(this.value)
  }
  // 添加条件组
  handleAddGroup = (data: ChildNodeType) => {
    console.log('handleAddGroup', cloneDeep(data))
    const children = get(this.value, data.parentPath)
    children.push({
      children: [{}],
      relation: get(this.props.relations, '0.value')
    })

    this.onChange(this.value)
  }

  handleDrop = (dropProps: DropProps, dragProps: DragProps) => {
    console.log('dropProps', cloneDeep(dropProps))
    console.log('dragProps', cloneDeep(dragProps))
    const parent = get(this.value, dragProps.data.parentPath)
    const dropParent = get(this.value, dropProps.data.parentPath) // 删掉

    const dragItem = parent.splice(dragProps.data.index, 1)[0] // 添加

    dropParent.splice(dropProps.data.index, 0, dragItem)

    this.onChange(this.value)
  }

  onValuesChange = (changedValues: any, allValues: any) => {
    console.log('changedValues', cloneDeep(changedValues))
    this.value = allValues

    const namePath = this.getNamePath(changedValues)
    const { cascades, onCascade } = this.props
    const lastIndex = namePath.length - 1
    const id = namePath[lastIndex]
    const path = namePath.slice(0, lastIndex)

    if (onCascade && cascades && cascades.indexOf(id) > -1) {
      const ctx = {
        // getValue: (cid: string | string) => {
        //   return this.form!.getFieldValue([...path, cid])
        // },
        // setValues: (cid: { [x: string]: any } | string, value: any) => {
        //   const fields = []

        //   if (isObject(cid)) {
        //     Object.keys(cid).forEach((k) => {
        //       const name = [...path, k]
        //       set(this.value, name, value)
        //       fields.push({
        //         name,
        //         value: cid[k],
        //       })
        //     })
        //   } else {
        //     const name = [...path, cid]
        //     set(this.value, name, value)
        //     fields.push({
        //       name,
        //       value,
        //     })
        //   }

        //   this.form!.setFields(fields)
        // },
        id,
        key: get(allValues, [...path, 'key']),
        value: this.form!.getFieldValue(namePath),
        record: get(this.value, path)
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
  addOperation(children: any[], parentPath: (string | number)[], canDrag: boolean, level: number) {
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
            canDrag,
            level + 1,
          )
          path.push('relation')
        }

        result.push(node)
      })
    }

    if (canDrag) {
      result.push({
        index: children.length,
        type: ACTION,
        key: `action-${parentPath.join('-')}`,
        parentPath,
        level: level + 1,
      })
    }

    return result
  }
  buildNodes(
    root: HierarchyPointNode<ChildNodeType>,
    canDrag: boolean,
  ): {
    nodes: HierarchyPointNode<ChildNodeType>
    height: number
  } {
    let leafCount = 0 // 画布高度

    let height = 0

    const nodes = root.eachAfter((d) => {
      d.y =
        //        关系节点的宽度 + 水平两个节点的距离 + 可以拖动时拖动按钮额外产生的宽度
        d.depth * (RELATION_WIDTH + COMPONENT_SPACE_HORIZONTAL + (canDrag ? EXTRA_MOVE_ICON_WIDTH : 0))
      // 根节点不能拖动，所以减去一个 EXTRA_MOVE_ICON_WIDTH
      if (canDrag && d.depth > 0) {
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
          height = findLastChild(d).x + COMPONENT_HEIGHT
        }
      }
    })

    return {
      nodes,
      height,
    }
  }

  createFields(nodes: HierarchyPointNode<ChildNodeType>[], canDrag: boolean) {
    const { fields, relations, rootRelations, canRootChange } = this.props
    const value = this.value
    const result: JSX.Element[] = []
    const DragItem = canDrag ? Drag : UnDrag
    nodes.forEach((node, nindex) => {
      const { data, x, y, parent } = node
      const { type, key, index, path } = data as ChildNodeType

      if (!parent) {
        // root 节点
        const initialValue = get(value, 'relation') || get(rootRelations, '0.value')
        const fieldElm = (
          <Field name={path} key='root'>
            {canRootChange ? (
              <Select
                disabled={!canDrag}
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
        if (canDrag) {
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
              canDrag={canDrag}
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
                              disabled: !canDrag,
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
          // 叶子节点
          ele = (
            <DragItem
              x={y}
              y={x}
              data={data}
              node={node}
              type={this.dndType}
              key={getHierarchyId(key, 'leaf')}
            >
              {fields.map((field: FieldProps, i: number) => {
                return this.renderField(field, i, canDrag, path, key)
              })}
              {canDrag && (
                <DeleteOutlined
                  style={{
                    marginLeft: COMPONENT_MARGIN,
                    cursor: 'pointer',
                    color: ICON_COLOR,
                    ...ALIGN_CENTER,
                    ...FLEX_ALIGN_CENTER,
                  }}
                  onClick={() => {
                    return this.handleDelete(data, node)
                  }}
                />
              )}
            </DragItem>
          )
        } else {
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
              {this.renderActions(data)}
            </div>
          )
        }

        result.push(ele)
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
    canDrag: boolean,
    path: (string | number)[],
    key: any,
  ): JSX.Element {
    const { id, rules, render } = field
    const namePath = [...path, id]
    // console.log(get(this.value, path))
    let element
    return (
      <Field name={namePath} key={getHierarchyId(key, id)} rules={rules}>
        {(control, meta, form) => {
          if (render) {
            const ctx = {
              // getValue: (cid: string) => {
              //   return this.form && this.form.getFieldValue([...path, cid])
              // },
              // setValues: (cid: string | { [key: string]: any }, value: any) => {
              //   if (!this.form) return
              //   const fields = []

              //   if (isObject(cid)) {
              //     Object.keys(cid).forEach((k) => {
              //       const name = [...path, k]
              //       set(this.value, name, value)
              //       fields.push({
              //         name,
              //         value: cid[k],
              //       })
              //     })
              //   } else {
              //     const name = [...path, cid]
              //     set(this.value, name, value)
              //     fields.push({
              //       name,
              //       value,
              //     })
              //   }

              //   this.form.setFields(fields)
              // },
              id,
              key,
              value: control.value,
              record: get(this.value, path),
              index
            }
            element = render(ctx)
          } else {
            element = field.element
          }

          const validateState = (meta.errors || []).length > 0 ? 'error' : undefined
          const help = (meta.errors || []).length > 0 ? meta.errors[0] : undefined
          const childElement = React.cloneElement(element as any, {
            disabled: element!.props.disabled || !canDrag,
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

  renderActions = (data: ChildNodeType) => {
    console.log('renderActions', cloneDeep(data))
    const { canAddCondition, canAddConditionGroup } = this.props
    // const curLevel = data.parentPath.reduce((memo, item) => {
    //   if(item === 'children') {
    //     memo += 1;
    //   }
    //   return memo;
    // }, 0);

    const finalCanAddCondition = canAddCondition(data)
    const finalCanAddConditionGroup = canAddConditionGroup(data)
    return (
      <div
        className='actions'
        style={{
          height: `${ACTION_HEIGHT}px`,
          marginTop: `${(COMPONENT_HEIGHT - ACTION_HEIGHT) / 2}px`
        }}
      >
        {
          <Tooltip title='添加条件'>
            <PlusOutlined
              style={{
                color: ICON_COLOR,
                padding: '0 8px',
                borderRight: '1px dashed ' + ICON_COLOR,
                height: '100%',
                ...FLEX_ALIGN_CENTER,
              }}
              onClick={() => {
                return finalCanAddCondition && this.handleAddCondition(data)
              }}
            />
          </Tooltip>
        }
        {
          <Tooltip title='添加条件组'>
            <PlusSquareOutlined
              style={{
                color: ICON_COLOR,
                padding: '0 8px',
                fontSize: '15px',
                height: '100%',
                ...FLEX_ALIGN_CENTER,
              }}
              onClick={() => {
                return finalCanAddConditionGroup && this.handleAddGroup(data)
              }}
            />
          </Tooltip>
        }
      </div>
    )
  }

  createLinks(links: HierarchyPointLink<ChildNodeType>[], canDrag: boolean) {
    return links.map((link) => {
      const source = link.source,
        target = link.target
      const sourceKey = source.data.key
      const targetKey = target.data.key
      let x

      if (!source.parent) {
        x = source.y + RELATION_WIDTH
      } else {
        x = source.y + RELATION_WIDTH + (canDrag ? COMPONENT_SPACE_HORIZONTAL : 0)
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
  /**
   * operations
   */
  handleDelete = (data: ChildNodeType, node: HierarchyPointNode<ChildNodeType>) => {
    console.log('handleDelete', cloneDeep(data), cloneDeep(node))
    if (node.parent!.children!.length === 2) {
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

    if (node.parent.children.length === 2) {
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

  // shouldComponentUpdate(nextProps: RuleTreeProps) {
  //   console.group('shouldComponentUpdate')
  //   console.log('nextProps', nextProps)
  //   console.log(nextProps.value !== this.value)
  //   console.groupEnd()
  //   // return nextProps.value !== this.value
  //   return true
  // }

  componentDidUpdate() {
    // const _this = this

    // const relations = this.props.relations
    // const initRelations: FieldData[] | { name: string[]; value: any }[] = []
    console.group('componentDidUpdate')
    // console.log('relationPaths', cloneDeep(this.relationPaths))
    console.log('getFieldsValue', cloneDeep(this.form!.getFieldsValue()))
    console.log('value', cloneDeep(this.value))
    console.groupEnd()
    // 新添加的条件组的关系是空的，因此需要把它们设置为默认值
    // this.relationPaths!.forEach((name) => {
    //   const relationValue = _this.form!.getFieldValue(name)
    //   // 始终更新
    //   // if (isUndefined(relationValue)) {
    //     const initialValue = get(_this.value, name) || get(relations, '0.value')
    //     initRelations.push({
    //       name,
    //       value: initialValue,
    //     })
    //     set(_this.value, name, initialValue)
    //   // }
    // })
    // this.form!.setFields(initRelations)
    this.form!.setFieldsValue(this.value)
  }

  onChange(value: any) {
    this.form!.setFieldsValue(value)
    const onChange = this.props.onChange
    // 强制 React 重新渲染
    this.setState({})
    console.log('onChange this.value', cloneDeep(this.value))
    if (onChange) {
      onChange(value)
    }
  }

  render() {
    console.group('render')
    const { style, disabled, onChange } = this.props
    const className = this.props.className === undefined ? '' : this.props.className
    const canDrag = !disabled
    // 作为受控组件使用的话，将value更新为props的value
    if (onChange && this.props.value) {
      this.inited = true
      this.value = cloneDeep(this.props.value)
    }
    console.log('value', cloneDeep(this.value))
    this.setKey(this.value, {})
    const rootNodeValue: RootNodeType = assign(
      {
        type: RELATION,
        path: ['relation'],
      },
      this.value,
    )
    rootNodeValue.children = this.addOperation(
      this.value.children,
      ['children'],
      canDrag,
      0,
    )
    console.log('rootNodeValue', cloneDeep(rootNodeValue))
    const root = hierarchy(rootNodeValue) as HierarchyPointNode<ChildNodeType>
    console.log('root', cloneDeep(root))
    const buildNodes = this.buildNodes(root, canDrag),
      nodes = buildNodes.nodes,
      height = buildNodes.height
    console.log('buildNodes', cloneDeep(buildNodes))

    const flattenNodes = nodes.descendants()
    const flattenLinks = nodes.links()
    console.log('flattenNodes', cloneDeep(flattenNodes))
    const fields = this.createFields(flattenNodes, canDrag)
    const links = this.createLinks(flattenLinks, canDrag)
    console.groupEnd()
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
}
