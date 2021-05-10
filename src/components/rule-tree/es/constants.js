const COMPONENT_MARGIN = 10;
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  RELATION: 'relation',
  LEAF: 'leaf',
  ACTION: 'action',
  RELATION_WIDTH: 80,
  COMPONENT_HEIGHT: 40,
  COMPONENT_SPACE_VERTICAL: 16,
  COMPONENT_SPACE_HORIZONTAL: 38,
  // 14 + 8(margin-right) + 8(padding) + 2
  COMPONENT_MARGIN: COMPONENT_MARGIN,
  ALIGN_CENTER: {
    height: 40,
    lineHeight: '39px'
  },
  FLEX_ALIGN_CENTER: {
    display: 'flex',
    alignItems: 'center'
  },
  RELATIONS: [{
    value: 'and',
    text: 'And'
  }, {
    value: 'or',
    text: 'Or'
  }]
};