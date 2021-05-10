// @ts-nocheck
import React from 'react';
import constants from './constants';
import { LinkProps } from "./interface";
const COMPONENT_HEIGHT = constants.COMPONENT_HEIGHT;

function isHorizontal(x1, x2) {
  if (x1 === x2) {
    return false;
  }

  return true;
}

function genKey(value) {
  if (value === void 0) {
    value = [];
  }

  const _value = value, x1 = _value[0], y1 = _value[1], x2 = _value[2], y2 = _value[3];
  return `${x1},${y1}-${x2},${y2}`;
}

export default class Link extends React.PureComponent<LinkProps, null> {
  drawLine(x1: any, y1: any, x2: any, y2: any): JSX.Element {
    const isH = isHorizontal(x1, x2);
    const width = isH ? x2 - x1 : Math.abs(y1 - y2);
    const highlight = this.props.highlight;
    const style = {
      height: isH ? 1 : width,
      width: isH ? width : 1,
      left: x1,
      top: (isH ? y1 : Math.min(y1, y2)) + COMPONENT_HEIGHT / 2,
      zIndex: highlight ? 1 : 0
    };
    const clsNames = `link ${highlight ? ['link-highlight'] : ''}`;
    return <div className={clsNames} style={style} key={genKey([x1, y1, x2, y2])} />;
  }
  drawLines(): JSX.Element {
    const _this$props = this.props, source = _this$props.source, target = _this$props.target;
    const x1 = source.x, y1 = source.y;
    const x2 = target.x, y2 = target.y;
    let lines = [];

    if (x1 === x2 || y1 === y2) {
      // 一条直线
      lines = [this.drawLine(x1, y1, x2, y2)];
    } else {
      // 一条折线，找到转折点，左(x1,y1) -> 右(x2,y2)
      const xm = (x1 + x2) / 2;
      const ym = y1;
      const xn = xm;
      const yn = y2;
      lines.push(this.drawLine(x1, y1, xm, ym));
      lines.push(this.drawLine(xm, ym, xn, yn));
      lines.push(this.drawLine(xn, yn, x2, y2));
    }

    return (
      <React.Fragment>
        {lines}
      </React.Fragment>
    );
  }
  render(): JSX.Element {
    return this.drawLines();
  }
}