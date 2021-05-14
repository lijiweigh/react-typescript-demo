import React from 'react';
import { COMPONENT_HEIGHT } from './constants';
import { LinkProps } from "./index.d";

function isHorizontal(x1: number, x2: number) {
  if (x1 === x2) {
    return false;
  }

  return true;
}

function genKey(value: number[]) {
  if (value === void 0) {
    value = [];
  }

  const [x1, y1, x2, y2] = value
  return `${x1},${y1}-${x2},${y2}`;
}

export default class Link extends React.PureComponent<LinkProps> {
  drawLine(x1: number, y1: number, x2: number, y2: number): JSX.Element {
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
    const {
      source,
      target
    } = this.props

    const x1 = source.x, y1 = source.y;
    const x2 = target.x, y2 = target.y;
    let lines: JSX.Element[] = [];

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
  render() {
    return this.drawLines()
  }
}