import React from 'react';
import { LinkProps } from './interface';
export default class Link extends React.PureComponent<LinkProps, null> {
    drawLine(x1: any, y1: any, x2: any, y2: any): JSX.Element;
    drawLines(): JSX.Element;
    render(): JSX.Element;
}
