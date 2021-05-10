import Button from "@alifd/next/es/button";
import Select from "@alifd/next/es/select";
import Icon from "@alifd/next/es/icon";
import Balloon from "@alifd/next/es/balloon";
import AlifdForm from "@alifd/next/es/form";
import React from 'react';
import Form, { Field } from 'rc-field-form';
import { hierarchy } from 'd3-hierarchy';
import { DndProvider, createDndContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import isUndefined from 'lodash/isUndefined';
import assign from 'lodash/assign';
import get from 'lodash/get';
import set from 'lodash/set';
import Drag, { UnDrag } from './drag';
import Drop from './drop';
import Link from './link';
import constants from './constants';
import GovIcon from '@aligov/icon';
import './index.scss';
const FormItem = AlifdForm.Item;
const Tooltip = Balloon.Tooltip;

function getHierarchyId(...args) {
  for (var _len = args.length, ids = new Array(_len), _key = 0; _key < _len; _key++) {
    ids[_key] = args[_key];
  }

  return ids.join('.');
} // eslint-disable-next-line


let gIndex = 0;
const RELATIONS = constants.RELATIONS, ACTION = constants.ACTION, RELATION = constants.RELATION, LEAF = constants.LEAF, COMPONENT_HEIGHT = constants.COMPONENT_HEIGHT, COMPONENT_SPACE_HORIZONTAL = constants.COMPONENT_SPACE_HORIZONTAL, COMPONENT_SPACE_VERTICAL = constants.COMPONENT_SPACE_VERTICAL, COMPONENT_MARGIN = constants.COMPONENT_MARGIN, RELATION_WIDTH = constants.RELATION_WIDTH, ALIGN_CENTER = constants.ALIGN_CENTER;
const DndContext = createDndContext(HTML5Backend);

const alwaysTrue = function alwaysTrue() {
  return true;
};
/* eslint-disable class-methods-use-this */


const RuleTree = (_React$Component => {

  function RuleTree(props) {
    let _this;

    _this = _React$Component.call(this, props) || this;
    _this.form = void 0;
    _this.dndType = void 0;
    _this.key = 0;
    _this.relationPaths = void 0;
    _this.value = void 0;
    _this.inited = false;
    _this.pathByKey = Object.create(null);

    _this.handleAddCondition = data => {
      const children = get(_this.value, data.parentPath);
      children.push({});

      _this.onChange(_this.value);
    };

    _this.handleAddGroup = data => {
      const children = get(_this.value, data.parentPath);
      children.push({
        children: [{}]
      });

      _this.onChange(_this.value);
    };

    _this.handleDrop = (dropProps, dragProps) => {
      const parent = get(_this.value, dragProps.data.parentPath);
      const dropParent = get(_this.value, dropProps.data.parentPath); // 删掉

      const dragItem = parent.splice(dragProps.data.index, 1)[0]; // 添加

      dropParent.splice(dropProps.data.index, 0, dragItem);

      _this.onChange(_this.value);
    };

    _this.handleDeleteGroup = node => {
      const deleteParent = node.parent;
      const deleteGrandPa = deleteParent.parent;

      if (!deleteGrandPa) {
        // root
        _this.value.children = [];
      } else if (!deleteGrandPa.data.parentPath) {
        // grandpa是root
        _this.value.children.splice(deleteParent.data.index, 1);
      } else {
        const dp = get(_this.value, deleteParent.data.parentPath);
        dp.splice(deleteParent.data.index, 1);
      }

      _this.onChange(_this.value);
    };

    _this.handleDelete = (data, node) => {
      if (node.parent.children.length === 2) {
        _this.handleDeleteSingleGroup(node);
      } else {
        const deleteParent = get(_this.value, data.parentPath);
        deleteParent.splice(data.index, 1);

        _this.onChange(_this.value);
      }
    };

    _this.onValuesChange = (changedValues, allValues) => {
      _this.value = allValues;

      const namePath = _this.getNamePath(changedValues);

      const _this$props = _this.props, cascades = _this$props.cascades, onCascade = _this$props.onCascade;
      const lastIndex = namePath.length - 1;
      const id = namePath[lastIndex];
      const path = namePath.slice(0, lastIndex);

      if (onCascade && cascades && cascades.indexOf(id) > -1) {
        const ctx = {
          getValue: function getValue(cid) {
            return _this.form.getFieldValue([].concat(path, [cid]));
          },
          setValues: function setValues(cid, value) {
            const fields = [];

            if (isObject(cid)) {
              Object.keys(cid).forEach(k => {
                const name = [].concat(path, [k]);
                set(_this.value, name, value);
                fields.push({
                  name,
                  value: cid[k]
                });
              });
            } else {
              const name = [].concat(path, [cid]);
              set(_this.value, name, value);
              fields.push({
                name,
                value
              });
            }

            _this.form.setFields(fields);
          },
          id,
          key: get(allValues, [].concat(path, ['key'])),
          value: _this.form.getFieldValue(namePath)
        };
        onCascade(ctx);
      }

      _this.onChange(_this.value);
    };

    _this.renderActions = data => {
      const _this$props2 = _this.props, canAddCondition = _this$props2.canAddCondition, canAddConditionGroup = _this$props2.canAddConditionGroup; // const curLevel = data.parentPath.reduce((memo, item) => {
      //   if(item === 'children') {
      //     memo += 1;
      //   }
      //   return memo;
      // }, 0);

      const finalCanAddCondition = canAddCondition(data);
      const finalCanAddConditionGroup = canAddConditionGroup(data);
      return (
        <div className="actions">
          {<Tooltip
            trigger={<Icon
              type="add"
              size="xs"
              className={`icon action-icon ${finalCanAddCondition ? '' : 'action-icon-disabled'}`}
              onClick={function onClick() {
                return finalCanAddCondition && _this.handleAddCondition(data);
              }} />}>
            添加条件
          </Tooltip>}
          {<Tooltip
            trigger={<GovIcon
              custom={true}
              type="tianjia"
              style={{
                margin: '0 4px',
                cursor: 'pointer',
                verticalAlign: 'middle'
              }}
              className={`icon ${finalCanAddConditionGroup ? '' : 'action-icon-disabled'}`}
              onClick={function onClick() {
                return finalCanAddConditionGroup && _this.handleAddGroup(data);
              }} />}>
            添加条件组
          </Tooltip>}
        </div>
      );
    };

    _this.dndType = `dndType-${gIndex}`;
    gIndex += 1;
    let defaultValue = {
      children: [{}]
    };

    if (!isUndefined(props.value)) {
      _this.inited = true;
      defaultValue = props.value;
    }

    _this.value = defaultValue;
    return _this;
  }

  const _proto = RuleTree.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!isUndefined(nextProps.value)) {
      this.inited = true;
      this.value = nextProps.value;
      this.onChange(this.value);
    }
  };

  _proto.getUniqKey = function getUniqKey(key, keyMap) {
    if (key in keyMap) {
      const k = key + 1;
      return this.getUniqKey(k, keyMap);
    }

    return key;
  };

  _proto.setKey = function setKey(value, keyMap) {
    const _this2 = this;

    /* eslint-disable no-param-reassign */
    const createKey = function createKey(v) {
      if (isUndefined(v.key)) {
        v.key = _this2.getUniqKey(_this2.key, keyMap);
      } else {
        v.key = _this2.getUniqKey(v.key, keyMap);
      }

      keyMap[v.key] = 1;

      if (v.children) {
        _this2.setKey(v.children, keyMap);
      }
    };
    /* eslint-enable no-param-reassign */


    if (isArray(value)) {
      value.forEach(v => {
        createKey(v);
      });
    } else {
      createKey(value);
    }
  };

  _proto.addDropAreaAndOperation = function addDropAreaAndOperation(children, parentPath, canDrag, level) {
    const _this3 = this;

    if (children === void 0) {
      children = [];
    }

    const result = [];

    if (children.length) {
      children.forEach((child, index) => {
        // @ts-ignore
        const path = [].concat(parentPath, [index]);
        const key = child.key;
        const node = assign({}, child, {
          type: LEAF,
          key,
          index,
          parentPath,
          path
        });

        if (child.children) {
          // 关系节点
          _this3.relationPaths.push(path);

          node.type = RELATION;
          node.children = _this3.addDropAreaAndOperation(child.children, path.concat(['children']), canDrag, level + 1);
          path.push('relation');
        }

        result.push(node);
      });
    }

    if (canDrag) {
      result.push({
        index: children.length,
        type: ACTION,
        key: `action-${parentPath.join('-')}`,
        parentPath,
        level: level + 1
      });
    }

    return result;
  };

  _proto.buildNodes = function buildNodes(root, canDrag) {
    let leafCount = 0; // 画布高度

    let height = 0;
    /* eslint-disable no-param-reassign */

    const nodes = root.eachAfter(d => {
      d.y = d.depth * (RELATION_WIDTH + COMPONENT_SPACE_HORIZONTAL + (canDrag ? COMPONENT_HEIGHT : 0));

      if (canDrag && d.depth > 0) {
        d.y -= COMPONENT_SPACE_HORIZONTAL;
      }

      if (d.data.type !== RELATION) {
        d.x = leafCount * (COMPONENT_HEIGHT + COMPONENT_SPACE_VERTICAL);
        leafCount += 1;
      } else {
        d.x = d.children && d.children.length ? (d.children[0].x + d.children[d.children.length - 1].x) / 2 : 0;

        if (!d.parent) {
          height = d.children[d.children.length - 1].x + COMPONENT_HEIGHT;
        }
      }
    });
    /* eslint-enable no-param-reassign */

    return {
      nodes,
      height
    };
  };

  _proto.createFields = function createFields(nodes, canDrag) {
    const _this4 = this;

    const _this$props3 = this.props, fields = _this$props3.fields, relations = _this$props3.relations, rootRelations = _this$props3.rootRelations, canRootChange = _this$props3.canRootChange;
    const value = this.value;
    const result = [];
    const DragItem = canDrag ? Drag : UnDrag;
    nodes.forEach((node, nindex) => {
      const data = node.data, x = node.x, y = node.y, parent = node.parent;
      const type = data.type, key = data.key, index = data.index, path = data.path;

      if (!parent) {
        // root 节点
        const initialValue = get(value, 'relation') || get(rootRelations, '0.value');
        const fieldElm = <Field name={path} key="root">
          {canRootChange ? <Select
            disabled={!canDrag}
            style={{
              width: RELATION_WIDTH,
              minWidth: RELATION_WIDTH,
              position: 'absolute',
              left: y,
              top: x + COMPONENT_MARGIN / 2
            }}>
            {rootRelations.map(relation => {
              return (
                <Select.Option value={relation.value} key={relation.value}>
                  {relation.text}
                </Select.Option>
              );
            })}
          </Select> : <Button
            style={{
              width: RELATION_WIDTH,
              minWidth: RELATION_WIDTH,
              position: 'absolute',
              left: y,
              top: x + COMPONENT_MARGIN / 2
            }}>
            {rootRelations[0].text}
          </Button>}
        </Field>;
        set(_this4.value, path, initialValue);
        result.push(fieldElm);
      } else {
        // 非root节点，关系节点/叶子节点/action节点/drop节点
        if (canDrag) {
          // drop
          const dropX = index === 0 ? x - COMPONENT_SPACE_VERTICAL : x - (x - (nodes[nindex - 1].x + COMPONENT_HEIGHT) + COMPONENT_SPACE_VERTICAL) / 2;
          /* eslint-disable react/jsx-no-bind */

          const dropEle = <Drop
            x={y}
            y={dropX}
            node={node}
            data={data}
            onDrop={_this4.handleDrop.bind(_this4)}
            canDrag={canDrag}
            type={_this4.dndType}
            key={getHierarchyId(key, 'drop')} />;
          /* eslint-enable react/jsx-no-bind */

          result.push(dropEle);
        }

        let ele;

        if (type === RELATION) {
          // 关系节点
          ele = <DragItem
            x={y}
            y={x}
            node={node}
            data={data}
            type={_this4.dndType}
            key={getHierarchyId(key, 'relation')}>
            {<Field name={path}>
              {control => {
                return (
                  <FormItem>
                    {<Select
                      {...{
                        disabled: !canDrag,
                        style: {
                          width: RELATION_WIDTH,
                          minWidth: RELATION_WIDTH
                        },
                        ...control
                      }}>
                      {relations.map(relation => {
                          return (
                            <Select.Option value={relation.value} key={relation.value}>
                              {relation.text}
                            </Select.Option>
                          );
                        })}
                    </Select>}
                  </FormItem>
                );
              }}
            </Field>}
          </DragItem>;
        } else if (type === LEAF) {
          // 叶子节点
          ele = <DragItem
            x={y}
            y={x}
            data={data}
            node={node}
            type={_this4.dndType}
            key={getHierarchyId(key, 'leaf')}>
            {fields.map((field, i) => {
              return _this4.renderField(field, i, canDrag, path, key);
            })}
            {canDrag && <Icon
              style={{
                marginLeft: COMPONENT_MARGIN,
                cursor: 'pointer',
                ...ALIGN_CENTER}
              }
              className="icon delete-icon"
              type="ashbin"
              size="xs"
              onClick={function onClick() {
                return _this4.handleDelete(data, node);
              }} />}
          </DragItem>;
        } else {
          // action节点
          ele = <div
            style={{
              position: 'absolute',
              left: y,
              top: x
            }}
            key={getHierarchyId(key, 'action')}>
            {_this4.renderActions(data)}
          </div>;
        }

        result.push(ele);
      }
    });
    return result;
  };

  _proto.createLinks = function createLinks(links, canDrag) {
    return links.map(link => {
      const source = link.source, target = link.target;
      const sourceKey = source.data.key;
      const targetKey = target.data.key;
      let x;

      if (!source.parent) {
        x = source.y + RELATION_WIDTH;
      } else {
        x = source.y + RELATION_WIDTH + (canDrag ? COMPONENT_SPACE_HORIZONTAL : 0);
      }

      return (
        <Link
          key={getHierarchyId(sourceKey, targetKey)}
          source={{
            x,
            y: source.x
          }}
          target={{
            x: target.y,
            y: target.x
          }} />
      );
    });
  }
  /**
   * operations
   */
  ;

  _proto.handleDeleteSingleGroup = function handleDeleteSingleGroup(node) {
    if (!node.parent || !node.parent.children) {
      return;
    }

    if (node.parent.children.length === 2) {
      const parent = node.parent;
      this.handleDeleteGroup(node);
      this.handleDeleteSingleGroup(parent);
    }
  };

  _proto.getNamePath = function getNamePath(changedValues) {
    const namePath = [];

    const fillNamePath = function fillNamePath(value) {
      if (isArray(value)) {
        value.forEach((v, i) => {
          if (!isUndefined(v)) {
            namePath.push(i);
            fillNamePath(v);
          }
        });
      } else if (isObject(value)) {
        const key = Object.keys(value)[0];
        namePath.push(key);

        if (key === 'children') {
          // children
          fillNamePath(value[key]);
        }
      }
    };

    fillNamePath(changedValues);
    return namePath;
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    const _this5 = this;

    const relations = this.props.relations;
    const initRelations = [];
    this.relationPaths.forEach(name => {
      const relationValue = _this5.form.getFieldValue(name);

      if (isUndefined(relationValue)) {
        const initialValue = get(_this5.value, name) || get(relations, '0.value');
        initRelations.push({
          name,
          value: initialValue
        });
        set(_this5.value, name, initialValue);
      }
    });
    this.form.setFields(initRelations);
  };

  _proto.onChange = function onChange(value) {
    this.form.setFieldsValue(value);
    var onChange = this.props.onChange;
    /** ruleTree 本质为非受控组件，如果希望外部控制value，需要同时修改组件key */

    this.setState({});

    if (onChange) {
      onChange(value);
    }
  }
  /**
   * 渲染field
   */
  ;

  _proto.renderField = function renderField(field, index, canDrag, path, key) {
    const _this6 = this;

    const id = field.id, rules = field.rules, render = field.render;
    const namePath = [].concat(path, [id]);
    let element;
    return (
      <Field name={namePath} key={getHierarchyId(key, id)} rules={rules}>
        {(control, meta, form) => {
            if (render) {
              const ctx = {
                getValue: function getValue(cid) {
                  return _this6.form && _this6.form.getFieldValue([].concat(path, [cid]));
                },
                setValues: function setValues(cid, value) {
                  if (!_this6.form) return;
                  const fields = [];

                  if (isObject(cid)) {
                    Object.keys(cid).forEach(k => {
                      const name = [].concat(path, [k]);
                      set(_this6.value, name, value);
                      fields.push({
                        name,
                        value: cid[k]
                      });
                    });
                  } else {
                    const name = [].concat(path, [cid]);
                    set(_this6.value, name, value);
                    fields.push({
                      name,
                      value
                    });
                  }

                  _this6.form.setFields(fields);
                },
                id,
                key,
                value: control.value
              };
              element = render(ctx);
            } else {
              element = field.element;
            }

            const validateState = (meta.errors || []).length > 0 ? 'error' : undefined;
            const help = (meta.errors || []).length > 0 ? meta.errors[0] : undefined;
            const childElement = React.cloneElement(element, {
              disabled: element.props.disabled || !canDrag,
              ...control
            });
            return (
              <FormItem
                style={{
                  marginLeft: index ? COMPONENT_MARGIN : 0
                }}
                help={help}
                validateState={validateState}>
                {childElement}
              </FormItem>
            );
          }}
      </Field>
    );
  }
  /**
   * icon actions 是否可点击
   */
  ;

  _proto.render = function render() {
    const _this7 = this;

    const _this$props4 = this.props, style = _this$props4.style, _this$props4$classNam = _this$props4.className, className = _this$props4$classNam === void 0 ? '' : _this$props4$classNam, disabled = _this$props4.disabled;
    const canDrag = !disabled;

    if (!this.inited && this.props.value) {
      this.inited = true;
      this.value = this.props.value;
    }

    this.setKey(this.value, {});
    const finalValue = assign({
      type: RELATION,
      path: ['relation']
    }, this.value);
    this.relationPaths = [];
    finalValue.children = this.addDropAreaAndOperation(this.value.children, ['children'], canDrag, 0);
    const root = hierarchy(finalValue);

    const _this$buildNodes = this.buildNodes(root, canDrag), nodes = _this$buildNodes.nodes, height = _this$buildNodes.height;

    const flattenNodes = nodes.descendants();
    const flattenLinks = nodes.links();
    const fields = this.createFields(flattenNodes, canDrag);
    const links = this.createLinks(flattenLinks, canDrag);
    return (
      <DndProvider manager={DndContext.dragDropManager}>
        {<div
          className={`ruleTreeContainer ${className}`}
          style={assign({
            height,
            style
          })}>
          {<Form
            component="div"
            ref={function ref(_ref) {
              _this7.form = _ref;
            }}
            onValuesChange={this.onValuesChange}
            initialValues={this.value}>
            {fields}
          </Form>}
          {links}
        </div>}
      </DndProvider>
    );
  };

  return RuleTree;
})(React.Component);

RuleTree.defaultProps = {
  rootRelations: RELATIONS,
  relations: RELATIONS,
  canAddCondition: alwaysTrue,
  canAddConditionGroup: alwaysTrue
};
export { RuleTree as default };