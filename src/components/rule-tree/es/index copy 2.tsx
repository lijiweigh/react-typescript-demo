// @ts-nocheck
import { RuleTreeProps, NodeType, DataType, DragProps, DropProps } from './interface'
import { Button, Select, Tooltip, Form as AntdForm } from 'antd'
import { DeleteOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons'
import { Icon, Balloon, } from '@alifd/next'
import React from 'react'
import Form, { Field, FormInstance } from 'rc-field-form'
import { hierarchy } from 'd3-hierarchy'
import { DndProvider, createDndContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import { isObject, isArray, isUndefined, assign, get, set } from 'lodash-es'
import Drag, { UnDrag } from './drag'
import Drop from './drop'
import Link from './link'
import constants from './constants'
import GovIcon from '@aligov/icon'
import './index.scss'

const FormItem = AntdForm.Item

function getHierarchyId(...args: any[]) {
  for (var _len = args.length, ids = new Array(_len), _key = 0; _key < _len; _key++) {
    ids[_key] = args[_key]
  }

  return ids.join('.')
}

let gIndex = 0

const {
  RELATIONS,
  ACTION,
  RELATION,
  LEAF,
  COMPONENT_HEIGHT,
  COMPONENT_SPACE_HORIZONTAL,
  COMPONENT_SPACE_VERTICAL,
  COMPONENT_MARGIN,
  RELATION_WIDTH,
  ALIGN_CENTER,
  FLEX_ALIGN_CENTER,
} = constants

const DndContext = createDndContext(HTML5Backend)

const alwaysTrue = function alwaysTrue() {
  return true
}

export default class RuleTree extends React.Component<RuleTreeProps, null> {
  form: FormInstance | undefined
  dndType: string
  key: number
  relationPaths: string[][] | undefined
  value: any
  inited: boolean
  pathByKey: any
  handleAddCondition: (data: any) => void
  handleAddGroup: (data: {
    parentPath: any
  }) => void
  handleDrop: (dropProps: any, dragProps: any) => void
  handleDeleteGroup: (node: any) => void
  handleDelete: (data: any, node: any) => void
  onValuesChange: (changedValues: any, allValues: any) => void
  constructor(props: any) {
    super(props)
    // this.form = void 0
    // this.dndType = void 0
    this.key = 0
    // this.relationPaths = void 0
    // this.value = void 0
    this.inited = false
    this.pathByKey = Object.create(null)

    this.dndType = `dndType-${gIndex}`
    gIndex += 1
    let defaultValue = {
      children: [{}],
    }

    if (!isUndefined(props.value)) {
      this.inited = true
      defaultValue = props.value
    }

    this.value = defaultValue
    return this
  }
  componentWillReceiveProps(nextProps: RuleTreeProps): void {
    if (!isUndefined(nextProps.value)) {
      this.inited = true
      this.value = nextProps.value
      this.onChange(this.value)
    }
  }

  handleAddCondition = (data) => {
    const children = get(this.value, data.parentPath)
    children.push({})

    this.onChange(this.value)
  }

  handleAddGroup = (data: { parentPath: any }) => {
    const children = get(this.value, data.parentPath)
    children.push({
      children: [{}],
    })

    this.onChange(this.value)
  }

  handleDrop = (dropProps, dragProps) => {
    console.log(dropProps)
    console.log(dragProps)
    const parent = get(this.value, dragProps.data.parentPath)
    const dropParent = get(this.value, dropProps.data.parentPath) // 删掉

    const dragItem = parent.splice(dragProps.data.index, 1)[0] // 添加

    dropParent.splice(dropProps.data.index, 0, dragItem)

    this.onChange(this.value)
  }

  handleDeleteGroup = (node) => {
    const deleteParent = node.parent
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

  handleDelete = (data, node) => {
    if (node.parent.children.length === 2) {
      this.handleDeleteSingleGroup(node)
    } else {
      const deleteParent = get(this.value, data.parentPath)
      deleteParent.splice(data.index, 1)

      this.onChange(this.value)
    }
  }

  onValuesChange = (changedValues, allValues) => {
    const _this = this
    _this.value = allValues

    const namePath = _this.getNamePath(changedValues)

    const _this$props = _this.props,
      cascades = _this$props.cascades,
      onCascade = _this$props.onCascade
    const lastIndex = namePath.length - 1
    const id = namePath[lastIndex]
    const path = namePath.slice(0, lastIndex)

    if (onCascade && cascades && cascades.indexOf(id) > -1) {
      const ctx = {
        getValue: (cid: any) => {
          return _this.form!.getFieldValue([...path, cid])
        },
        setValues: (cid: { [x: string]: any }, value: any) => {
          const fields = []

          if (isObject(cid)) {
            Object.keys(cid).forEach((k) => {
              const name = [...path, k]
              set(_this.value, name, value)
              fields.push({
                name,
                value: cid[k],
              })
            })
          } else {
            const name = [].concat(path, [cid])
            set(_this.value, name, value)
            fields.push({
              name,
              value,
            })
          }

          _this.form.setFields(fields)
        },
        id,
        key: get(allValues, [].concat(path, ['key'])),
        value: _this.form.getFieldValue(namePath),
      }
      onCascade(ctx)
    }

    _this.onChange(_this.value)
  }

  renderActions = (data) => {
    const this$props2 = this.props,
      canAddCondition = this$props2.canAddCondition,
      canAddConditionGroup = this$props2.canAddConditionGroup // const curLevel = data.parentPath.reduce((memo, item) => {
    //   if(item === 'children') {
    //     memo += 1;
    //   }
    //   return memo;
    // }, 0);

    const finalCanAddCondition = canAddCondition(data)
    const finalCanAddConditionGroup = canAddConditionGroup(data)
    return (
      <div className='actions'>
        {
          <Tooltip
            title='添加条件'
          >
            <PlusOutlined
                disabled={!finalCanAddCondition}
                style={{
                  color: '#c7d0d9',
                  padding: '0 8px',
                  borderRight: '1px dashed #c7d0d9',
                  height: '100%',
                  ...FLEX_ALIGN_CENTER
                }}
                onClick={() => {
                  return finalCanAddCondition && this.handleAddCondition(data)
                }}
              />
          </Tooltip>
        }
        {
          <Tooltip
            title='添加条件组'
          >
            <PlusSquareOutlined
                style={{
                  color: '#c7d0d9',
                  padding: '0 8px',
                  fontSize: '15px',
                  height: '100%',
                  ...FLEX_ALIGN_CENTER
                }}
                disabled={!finalCanAddCondition}
                onClick={() => {
                  return finalCanAddConditionGroup && this.handleAddGroup(data)
                }}
              />
          </Tooltip>
        }
      </div>
    )
  }

  getUniqKey(key: any, keyMap: any): any {
    if (key in keyMap) {
      const k = key + 1
      return this.getUniqKey(k, keyMap)
    }

    return key
  }
  setKey(value: any, keyMap: any): void {
    const _this = this

    /* eslint-disable no-param-reassign */
    const createKey = (v) => {
      if (isUndefined(v.key)) {
        v.key = _this.getUniqKey(_this.key, keyMap)
      } else {
        v.key = _this.getUniqKey(v.key, keyMap)
      }

      keyMap[v.key] = 1

      if (v.children) {
        _this.setKey(v.children, keyMap)
      }
    }
    /* eslint-enable no-param-reassign */

    if (isArray(value)) {
      value.forEach((v) => {
        createKey(v)
      })
    } else {
      createKey(value)
    }
  }
  addDropAreaAndOperation(children: any[], parentPath: string[], canDrag: any, level: any): any[] {
    const _this = this

    if (children === void 0) {
      children = []
    }

    const result = []

    if (children.length) {
      children.forEach((child, index) => {
        // @ts-ignore
        const path = [].concat(parentPath, [index])
        const key = child.key
        const node = assign({}, child, {
          type: LEAF,
          key,
          index,
          parentPath,
          path,
        })

        if (child.children) {
          // 关系节点
          _this.relationPaths.push(path)

          node.type = RELATION
          node.children = _this.addDropAreaAndOperation(
            child.children,
            path.concat(['children']),
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
    root: any,
    canDrag: any,
  ): {
    nodes: any
    height: number
  } {
    let leafCount = 0 // 画布高度

    let height = 0
    /* eslint-disable no-param-reassign */

    const nodes = root.eachAfter((d) => {
      d.y =
        d.depth * (RELATION_WIDTH + COMPONENT_SPACE_HORIZONTAL + (canDrag ? COMPONENT_HEIGHT : 0))

      if (canDrag && d.depth > 0) {
        d.y -= COMPONENT_SPACE_HORIZONTAL
      }

      if (d.data.type !== RELATION) {
        d.x = leafCount * (COMPONENT_HEIGHT + COMPONENT_SPACE_VERTICAL)
        leafCount += 1
      } else {
        d.x =
          d.children && d.children.length
            ? (d.children[0].x + d.children[d.children.length - 1].x) / 2
            : 0

        if (!d.parent) {
          height = d.children[d.children.length - 1].x + COMPONENT_HEIGHT
        }
      }
    })
    /* eslint-enable no-param-reassign */

    return {
      nodes,
      height,
    }
  }
  createFields(nodes: any, canDrag: any): any[] {
    const _this = this

    const _this$props3 = this.props,
      fields = _this$props3.fields,
      relations = _this$props3.relations,
      rootRelations = _this$props3.rootRelations,
      canRootChange = _this$props3.canRootChange
    const value = this.value
    const result: any[] = []
    const DragItem = canDrag ? Drag : UnDrag
    nodes.forEach((node, nindex) => {
      const data = node.data,
        x = node.x,
        y = node.y,
        parent = node.parent
      const type = data.type,
        key = data.key,
        index = data.index,
        path = data.path

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
                  minWidth: RELATION_WIDTH,
                  position: 'absolute',
                  left: y,
                  top: x + COMPONENT_MARGIN / 2,
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
                  minWidth: RELATION_WIDTH,
                  position: 'absolute',
                  left: y,
                  top: x + COMPONENT_MARGIN / 2,
                }}
              >
                {rootRelations[0].text}
              </Button>
            )}
          </Field>
        )
        set(_this.value, path, initialValue)
        result.push(fieldElm)
      } else {
        // 非root节点，关系节点/叶子节点/action节点/drop节点
        if (canDrag) {
          // drop
          const dropX =
            index === 0
              ? x - COMPONENT_SPACE_VERTICAL
              : x - (x - (nodes[nindex - 1].x + COMPONENT_HEIGHT) + COMPONENT_SPACE_VERTICAL) / 2
          /* eslint-disable react/jsx-no-bind */

          const dropEle = (
            <Drop
              x={y}
              y={dropX}
              node={node}
              data={data}
              onDrop={_this.handleDrop.bind(_this)}
              canDrag={canDrag}
              type={_this.dndType}
              key={getHierarchyId(key, 'drop')}
            />
          )
          /* eslint-enable react/jsx-no-bind */

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
              type={_this.dndType}
              key={getHierarchyId(key, 'relation')}
            >
              {
                <Field name={path}>
                  {(control) => {
                    return (
                      <FormItem
                        style={{
                          marginBottom: 0,
                          ...FLEX_ALIGN_CENTER
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
              type={_this.dndType}
              key={getHierarchyId(key, 'leaf')}
            >
              {fields.map((field, i) => {
                return _this.renderField(field, i, canDrag, path, key)
              })}
              {canDrag && (
                <DeleteOutlined
                  style={{
                    marginLeft: COMPONENT_MARGIN,
                    cursor: 'pointer',
                    color: '#c7d0d9',
                    ...ALIGN_CENTER,
                    ...FLEX_ALIGN_CENTER
                  }}
                  onClick={() => {
                    return _this.handleDelete(data, node)
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
              {_this.renderActions(data)}
            </div>
          )
        }

        result.push(ele)
      }
    })
    return result
  }
  createLinks(links: any, canDrag: any): any {
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
  handleDeleteSingleGroup(node: any): void {
    if (!node.parent || !node.parent.children) {
      return
    }

    if (node.parent.children.length === 2) {
      const parent = node.parent
      this.handleDeleteGroup(node)
      this.handleDeleteSingleGroup(parent)
    }
  }
  getNamePath(changedValues: any): any[] {
    const namePath = []

    const fillNamePath = (value) => {
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
          fillNamePath(value[key])
        }
      }
    }

    fillNamePath(changedValues)
    return namePath
  }
  componentDidUpdate(): void {
    const _this = this

    const relations = this.props.relations
    const initRelations = []
    this.relationPaths.forEach((name) => {
      const relationValue = _this.form.getFieldValue(name)

      if (isUndefined(relationValue)) {
        const initialValue = get(_this.value, name) || get(relations, '0.value')
        initRelations.push({
          name,
          value: initialValue,
        })
        set(_this.value, name, initialValue)
      }
    })
    this.form.setFields(initRelations)
  }
  onChange(value: any): void {
    this.form.setFieldsValue(value)
    var onChange = this.props.onChange
    /** ruleTree 本质为非受控组件，如果希望外部控制value，需要同时修改组件key */

    this.setState({})

    if (onChange) {
      onChange(value)
    }
  }
  /**
   * 渲染field
   */
  renderField(field: any, index: any, canDrag: any, path: any, key: any): JSX.Element {
    const _this = this

    const id = field.id,
      rules = field.rules,
      render = field.render
    const namePath = [].concat(path, [id])
    let element
    return (
      <Field name={namePath} key={getHierarchyId(key, id)} rules={rules}>
        {(control, meta, form) => {
          if (render) {
            const ctx = {
              getValue: (cid) => {
                return _this.form && _this.form.getFieldValue([].concat(path, [cid]))
              },
              setValues: (cid, value) => {
                if (!_this.form) return
                const fields = []

                if (isObject(cid)) {
                  Object.keys(cid).forEach((k) => {
                    const name = [].concat(path, [k])
                    set(_this.value, name, value)
                    fields.push({
                      name,
                      value: cid[k],
                    })
                  })
                } else {
                  const name = [].concat(path, [cid])
                  set(_this.value, name, value)
                  fields.push({
                    name,
                    value,
                  })
                }

                _this.form.setFields(fields)
              },
              id,
              key,
              value: control.value,
            }
            element = render(ctx)
          } else {
            element = field.element
          }

          const validateState = (meta.errors || []).length > 0 ? 'error' : undefined
          const help = (meta.errors || []).length > 0 ? meta.errors[0] : undefined
          const childElement = React.cloneElement(element, {
            disabled: element.props.disabled || !canDrag,
            ...control,
          })
          return (
            <FormItem
              style={{
                marginLeft: index ? COMPONENT_MARGIN : 0,
                marginBottom: 0,
                ...FLEX_ALIGN_CENTER
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
  /**
   * icon actions 是否可点击
   */
  render(): JSX.Element {
    const _this = this

    const _this$props4 = this.props,
      style = _this$props4.style,
      _this$props4$classNam = _this$props4.className,
      className = _this$props4$classNam === void 0 ? '' : _this$props4$classNam,
      disabled = _this$props4.disabled
    const canDrag = !disabled

    if (!this.inited && this.props.value) {
      this.inited = true
      this.value = this.props.value
    }

    this.setKey(this.value, {})
    const finalValue = assign(
      {
        type: RELATION,
        path: ['relation'],
      },
      this.value,
    )
    this.relationPaths = []
    finalValue.children = this.addDropAreaAndOperation(
      this.value.children,
      ['children'],
      canDrag,
      0,
    )
    const root = hierarchy(finalValue)

    const _this$buildNodes = this.buildNodes(root, canDrag),
      nodes = _this$buildNodes.nodes,
      height = _this$buildNodes.height

    const flattenNodes = nodes.descendants()
    const flattenLinks = nodes.links()
    const fields = this.createFields(flattenNodes, canDrag)
    const links = this.createLinks(flattenLinks, canDrag)
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
                ref={(_ref) => {
                  _ref && (_this.form = _ref)
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
