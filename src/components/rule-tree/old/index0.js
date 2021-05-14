import _extends from "@babel/runtime/helpers/extends";
import _Button from "@alifd/next/es/button";
import _Select from "@alifd/next/es/select";
import _Icon from "@alifd/next/es/icon";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _Balloon from "@alifd/next/es/balloon";
import _Form from "@alifd/next/es/form";
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
import Drag, { UnDrag } from '../es/drag';
import Drop from '../es/drop';
import Link from '../es/link';
import constants from '../es/constants';
import GovIcon from '@aligov/icon';
import './index.scss';
var FormItem = _Form.Item;
var Tooltip = _Balloon.Tooltip;

function getHierarchyId() {
  for (var _len = arguments.length, ids = new Array(_len), _key = 0; _key < _len; _key++) {
    ids[_key] = arguments[_key];
  }

  return ids.join('.');
} // eslint-disable-next-line


var gIndex = 0;
var RELATIONS = constants.RELATIONS,
    ACTION = constants.ACTION,
    RELATION = constants.RELATION,
    LEAF = constants.LEAF,
    COMPONENT_HEIGHT = constants.COMPONENT_HEIGHT,
    COMPONENT_SPACE_HORIZONTAL = constants.COMPONENT_SPACE_HORIZONTAL,
    COMPONENT_SPACE_VERTICAL = constants.COMPONENT_SPACE_VERTICAL,
    COMPONENT_MARGIN = constants.COMPONENT_MARGIN,
    RELATION_WIDTH = constants.RELATION_WIDTH,
    ALIGN_CENTER = constants.ALIGN_CENTER;
var DndContext = createDndContext(HTML5Backend);

var alwaysTrue = function alwaysTrue() {
  return true;
};
/* eslint-disable class-methods-use-this */


var RuleTree = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(RuleTree, _React$Component);

  function RuleTree(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.form = void 0;
    _this.dndType = void 0;
    _this.key = 0;
    _this.relationPaths = void 0;
    _this.value = void 0;
    _this.inited = false;
    _this.pathByKey = Object.create(null);

    _this.handleAddCondition = function (data) {
      var children = get(_this.value, data.parentPath);
      children.push({});

      _this.onChange(_this.value);
    };

    _this.handleAddGroup = function (data) {
      var children = get(_this.value, data.parentPath);
      children.push({
        children: [{}]
      });

      _this.onChange(_this.value);
    };

    _this.handleDrop = function (dropProps, dragProps) {
      var parent = get(_this.value, dragProps.data.parentPath);
      var dropParent = get(_this.value, dropProps.data.parentPath); // 删掉

      var dragItem = parent.splice(dragProps.data.index, 1)[0]; // 添加

      dropParent.splice(dropProps.data.index, 0, dragItem);

      _this.onChange(_this.value);
    };

    _this.handleDeleteGroup = function (node) {
      var deleteParent = node.parent;
      var deleteGrandPa = deleteParent.parent;

      if (!deleteGrandPa) {
        // root
        _this.value.children = [];
      } else if (!deleteGrandPa.data.parentPath) {
        // grandpa是root
        _this.value.children.splice(deleteParent.data.index, 1);
      } else {
        var dp = get(_this.value, deleteParent.data.parentPath);
        dp.splice(deleteParent.data.index, 1);
      }

      _this.onChange(_this.value);
    };

    _this.handleDelete = function (data, node) {
      if (node.parent.children.length === 2) {
        _this.handleDeleteSingleGroup(node);
      } else {
        var deleteParent = get(_this.value, data.parentPath);
        deleteParent.splice(data.index, 1);

        _this.onChange(_this.value);
      }
    };

    _this.onValuesChange = function (changedValues, allValues) {
      _this.value = allValues;

      var namePath = _this.getNamePath(changedValues);

      var _this$props = _this.props,
          cascades = _this$props.cascades,
          onCascade = _this$props.onCascade;
      var lastIndex = namePath.length - 1;
      var id = namePath[lastIndex];
      var path = namePath.slice(0, lastIndex);

      if (onCascade && cascades && cascades.indexOf(id) > -1) {
        var ctx = {
          getValue: function getValue(cid) {
            return _this.form.getFieldValue([].concat(path, [cid]));
          },
          setValues: function setValues(cid, value) {
            var fields = [];

            if (isObject(cid)) {
              Object.keys(cid).forEach(function (k) {
                var name = [].concat(path, [k]);
                set(_this.value, name, value);
                fields.push({
                  name: name,
                  value: cid[k]
                });
              });
            } else {
              var name = [].concat(path, [cid]);
              set(_this.value, name, value);
              fields.push({
                name: name,
                value: value
              });
            }

            _this.form.setFields(fields);
          },
          id: id,
          key: get(allValues, [].concat(path, ['key'])),
          value: _this.form.getFieldValue(namePath)
        };
        onCascade(ctx);
      }

      _this.onChange(_this.value);
    };

    _this.renderActions = function (data) {
      var _this$props2 = _this.props,
          canAddCondition = _this$props2.canAddCondition,
          canAddConditionGroup = _this$props2.canAddConditionGroup; // const curLevel = data.parentPath.reduce((memo, item) => {
      //   if(item === 'children') {
      //     memo += 1;
      //   }
      //   return memo;
      // }, 0);

      var finalCanAddCondition = canAddCondition(data);
      var finalCanAddConditionGroup = canAddConditionGroup(data);
      return /*#__PURE__*/React.createElement("div", {
        className: "actions"
      }, /*#__PURE__*/React.createElement(Tooltip, {
        trigger: /*#__PURE__*/React.createElement(_Icon, {
          type: "add",
          size: "xs",
          className: "icon action-icon " + (finalCanAddCondition ? '' : 'action-icon-disabled'),
          onClick: function onClick() {
            return finalCanAddCondition && _this.handleAddCondition(data);
          }
        })
      }, "\u6DFB\u52A0\u6761\u4EF6"), /*#__PURE__*/React.createElement(Tooltip, {
        trigger: /*#__PURE__*/React.createElement(GovIcon, {
          custom: true,
          type: "tianjia",
          style: {
            margin: '0 4px',
            cursor: 'pointer',
            verticalAlign: 'middle'
          },
          className: "icon " + (finalCanAddConditionGroup ? '' : 'action-icon-disabled'),
          onClick: function onClick() {
            return finalCanAddConditionGroup && _this.handleAddGroup(data);
          }
        })
      }, "\u6DFB\u52A0\u6761\u4EF6\u7EC4"));
    };

    _this.dndType = "dndType-" + gIndex;
    gIndex += 1;
    var defaultValue = {
      children: [{}]
    };

    if (!isUndefined(props.value)) {
      _this.inited = true;
      defaultValue = props.value;
    }

    _this.value = defaultValue;
    return _this;
  }

  var _proto = RuleTree.prototype;

  _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!isUndefined(nextProps.value)) {
      this.inited = true;
      this.value = nextProps.value;
      this.onChange(this.value);
    }
  };

  _proto.getUniqKey = function getUniqKey(key, keyMap) {
    if (key in keyMap) {
      var k = key + 1;
      return this.getUniqKey(k, keyMap);
    }

    return key;
  };

  _proto.setKey = function setKey(value, keyMap) {
    var _this2 = this;

    /* eslint-disable no-param-reassign */
    var createKey = function createKey(v) {
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
      value.forEach(function (v) {
        createKey(v);
      });
    } else {
      createKey(value);
    }
  };

  _proto.addDropAreaAndOperation = function addDropAreaAndOperation(children, parentPath, canDrag, level) {
    var _this3 = this;

    if (children === void 0) {
      children = [];
    }

    var result = [];

    if (children.length) {
      children.forEach(function (child, index) {
        // @ts-ignore
        var path = [].concat(parentPath, [index]);
        var key = child.key;
        var node = assign({}, child, {
          type: LEAF,
          key: key,
          index: index,
          parentPath: parentPath,
          path: path
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
        key: "action-" + parentPath.join('-'),
        parentPath: parentPath,
        level: level + 1
      });
    }

    return result;
  };

  _proto.buildNodes = function buildNodes(root, canDrag) {
    var leafCount = 0; // 画布高度

    var height = 0;
    /* eslint-disable no-param-reassign */

    var nodes = root.eachAfter(function (d) {
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
      nodes: nodes,
      height: height
    };
  };

  _proto.createFields = function createFields(nodes, canDrag) {
    var _this4 = this;

    var _this$props3 = this.props,
        fields = _this$props3.fields,
        relations = _this$props3.relations,
        rootRelations = _this$props3.rootRelations,
        canRootChange = _this$props3.canRootChange;
    var value = this.value;
    var result = [];
    var DragItem = canDrag ? Drag : UnDrag;
    nodes.forEach(function (node, nindex) {
      var data = node.data,
          x = node.x,
          y = node.y,
          parent = node.parent;
      var type = data.type,
          key = data.key,
          index = data.index,
          path = data.path;

      if (!parent) {
        // root 节点
        var initialValue = get(value, 'relation') || get(rootRelations, '0.value');
        var fieldElm = /*#__PURE__*/React.createElement(Field, {
          name: path,
          key: "root"
        }, canRootChange ? /*#__PURE__*/React.createElement(_Select, {
          disabled: !canDrag,
          style: {
            width: RELATION_WIDTH,
            minWidth: RELATION_WIDTH,
            position: 'absolute',
            left: y,
            top: x + COMPONENT_MARGIN / 2
          }
        }, rootRelations.map(function (relation) {
          return /*#__PURE__*/React.createElement(_Select.Option, {
            value: relation.value,
            key: relation.value
          }, relation.text);
        })) : /*#__PURE__*/React.createElement(_Button, {
          style: {
            width: RELATION_WIDTH,
            minWidth: RELATION_WIDTH,
            position: 'absolute',
            left: y,
            top: x + COMPONENT_MARGIN / 2
          }
        }, rootRelations[0].text));
        set(_this4.value, path, initialValue);
        result.push(fieldElm);
      } else {
        // 非root节点，关系节点/叶子节点/action节点/drop节点
        if (canDrag) {
          // drop
          var dropX = index === 0 ? x - COMPONENT_SPACE_VERTICAL : x - (x - (nodes[nindex - 1].x + COMPONENT_HEIGHT) + COMPONENT_SPACE_VERTICAL) / 2;
          /* eslint-disable react/jsx-no-bind */

          var dropEle = /*#__PURE__*/React.createElement(Drop, {
            x: y,
            y: dropX,
            node: node,
            data: data,
            onDrop: _this4.handleDrop.bind(_this4),
            canDrag: canDrag,
            type: _this4.dndType,
            key: getHierarchyId(key, 'drop')
          });
          /* eslint-enable react/jsx-no-bind */

          result.push(dropEle);
        }

        var ele;

        if (type === RELATION) {
          // 关系节点
          ele = /*#__PURE__*/React.createElement(DragItem, {
            x: y,
            y: x,
            node: node,
            data: data,
            type: _this4.dndType,
            key: getHierarchyId(key, 'relation')
          }, /*#__PURE__*/React.createElement(Field, {
            name: path
          }, function (control) {
            return /*#__PURE__*/React.createElement(FormItem, null, /*#__PURE__*/React.createElement(_Select, _extends({
              disabled: !canDrag,
              style: {
                width: RELATION_WIDTH,
                minWidth: RELATION_WIDTH
              }
            }, control), relations.map(function (relation) {
              return /*#__PURE__*/React.createElement(_Select.Option, {
                value: relation.value,
                key: relation.value
              }, relation.text);
            })));
          }));
        } else if (type === LEAF) {
          // 叶子节点
          ele = /*#__PURE__*/React.createElement(DragItem, {
            x: y,
            y: x,
            data: data,
            node: node,
            type: _this4.dndType,
            key: getHierarchyId(key, 'leaf')
          }, fields.map(function (field, i) {
            return _this4.renderField(field, i, canDrag, path, key);
          }), canDrag && /*#__PURE__*/React.createElement(_Icon, {
            style: _extends({
              marginLeft: COMPONENT_MARGIN,
              cursor: 'pointer'
            }, ALIGN_CENTER),
            className: "icon delete-icon",
            type: "ashbin",
            size: "xs",
            onClick: function onClick() {
              return _this4.handleDelete(data, node);
            }
          }));
        } else {
          // action节点
          ele = /*#__PURE__*/React.createElement("div", {
            style: {
              position: 'absolute',
              left: y,
              top: x
            },
            key: getHierarchyId(key, 'action')
          }, _this4.renderActions(data));
        }

        result.push(ele);
      }
    });
    return result;
  };

  _proto.createLinks = function createLinks(links, canDrag) {
    return links.map(function (link) {
      var source = link.source,
          target = link.target;
      var sourceKey = source.data.key;
      var targetKey = target.data.key;
      var x;

      if (!source.parent) {
        x = source.y + RELATION_WIDTH;
      } else {
        x = source.y + RELATION_WIDTH + (canDrag ? COMPONENT_SPACE_HORIZONTAL : 0);
      }

      return /*#__PURE__*/React.createElement(Link, {
        key: getHierarchyId(sourceKey, targetKey),
        source: {
          x: x,
          y: source.x
        },
        target: {
          x: target.y,
          y: target.x
        }
      });
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
      var parent = node.parent;
      this.handleDeleteGroup(node);
      this.handleDeleteSingleGroup(parent);
    }
  };

  _proto.getNamePath = function getNamePath(changedValues) {
    var namePath = [];

    var fillNamePath = function fillNamePath(value) {
      if (isArray(value)) {
        value.forEach(function (v, i) {
          if (!isUndefined(v)) {
            namePath.push(i);
            fillNamePath(v);
          }
        });
      } else if (isObject(value)) {
        var key = Object.keys(value)[0];
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
    var _this5 = this;

    var relations = this.props.relations;
    var initRelations = [];
    this.relationPaths.forEach(function (name) {
      var relationValue = _this5.form.getFieldValue(name);

      if (isUndefined(relationValue)) {
        var initialValue = get(_this5.value, name) || get(relations, '0.value');
        initRelations.push({
          name: name,
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
    var _this6 = this;

    var id = field.id,
        rules = field.rules,
        render = field.render;
    var namePath = [].concat(path, [id]);
    var element;
    return /*#__PURE__*/React.createElement(Field, {
      name: namePath,
      key: getHierarchyId(key, id),
      rules: rules
    }, function (control, meta, form) {
      if (render) {
        var ctx = {
          getValue: function getValue(cid) {
            return _this6.form && _this6.form.getFieldValue([].concat(path, [cid]));
          },
          setValues: function setValues(cid, value) {
            if (!_this6.form) return;
            var fields = [];

            if (isObject(cid)) {
              Object.keys(cid).forEach(function (k) {
                var name = [].concat(path, [k]);
                set(_this6.value, name, value);
                fields.push({
                  name: name,
                  value: cid[k]
                });
              });
            } else {
              var name = [].concat(path, [cid]);
              set(_this6.value, name, value);
              fields.push({
                name: name,
                value: value
              });
            }

            _this6.form.setFields(fields);
          },
          id: id,
          key: key,
          value: control.value
        };
        element = render(ctx);
      } else {
        element = field.element;
      }

      var validateState = (meta.errors || []).length > 0 ? 'error' : undefined;
      var help = (meta.errors || []).length > 0 ? meta.errors[0] : undefined;
      var childElement = /*#__PURE__*/React.cloneElement(element, _extends({
        disabled: element.props.disabled || !canDrag
      }, control));
      return /*#__PURE__*/React.createElement(FormItem, {
        style: {
          marginLeft: index ? COMPONENT_MARGIN : 0
        },
        help: help,
        validateState: validateState
      }, childElement);
    });
  }
  /**
   * icon actions 是否可点击
   */
  ;

  _proto.render = function render() {
    var _this7 = this;

    var _this$props4 = this.props,
        style = _this$props4.style,
        _this$props4$classNam = _this$props4.className,
        className = _this$props4$classNam === void 0 ? '' : _this$props4$classNam,
        disabled = _this$props4.disabled;
    var canDrag = !disabled;

    if (!this.inited && this.props.value) {
      this.inited = true;
      this.value = this.props.value;
    }

    this.setKey(this.value, {});
    var finalValue = assign({
      type: RELATION,
      path: ['relation']
    }, this.value);
    this.relationPaths = [];
    finalValue.children = this.addDropAreaAndOperation(this.value.children, ['children'], canDrag, 0);
    var root = hierarchy(finalValue);

    var _this$buildNodes = this.buildNodes(root, canDrag),
        nodes = _this$buildNodes.nodes,
        height = _this$buildNodes.height;

    var flattenNodes = nodes.descendants();
    var flattenLinks = nodes.links();
    var fields = this.createFields(flattenNodes, canDrag);
    var links = this.createLinks(flattenLinks, canDrag);
    return /*#__PURE__*/React.createElement(DndProvider, {
      manager: DndContext.dragDropManager
    }, /*#__PURE__*/React.createElement("div", {
      className: "ruleTreeContainer " + className,
      style: assign({
        height: height,
        style: style
      })
    }, /*#__PURE__*/React.createElement(Form, {
      component: "div",
      ref: function ref(_ref) {
        _this7.form = _ref;
      },
      onValuesChange: this.onValuesChange,
      initialValues: this.value
    }, fields), links));
  };

  return RuleTree;
}(React.Component);

RuleTree.defaultProps = {
  rootRelations: RELATIONS,
  relations: RELATIONS,
  canAddCondition: alwaysTrue,
  canAddConditionGroup: alwaysTrue
};
export { RuleTree as default };