import React from 'react';
import { FormInstance } from 'rc-field-form';
import { RuleTreeProps, NodeType, DataType, DragProps, DropProps } from '../es';
import './index.scss';
export default class RuleTree extends React.Component<RuleTreeProps, null> {
    form: FormInstance;
    dndType: string;
    key: number;
    relationPaths: string[][];
    value: any;
    inited: boolean;
    pathByKey: any;
    static defaultProps: {
        rootRelations: {
            value: string;
            text: string;
        }[];
        relations: {
            value: string;
            text: string;
        }[];
        canAddCondition: () => boolean;
        canAddConditionGroup: () => boolean;
    };
    constructor(props: any);
    componentWillReceiveProps(nextProps: RuleTreeProps): void;
    getUniqKey(key: any, keyMap: any): any;
    setKey(value: any, keyMap: any): void;
    addDropAreaAndOperation(children: any[], parentPath: string[], canDrag: any, level: any): any[];
    buildNodes(root: any, canDrag: any): {
        nodes: any;
        height: number;
    };
    createFields(nodes: any, canDrag: any): any[];
    createLinks(links: any, canDrag: any): any;
    /**
     * operations
     */
    handleAddCondition: (data: DataType) => void;
    handleAddGroup: (data: any) => void;
    handleDrop: (dropProps: DropProps, dragProps: DragProps) => void;
    handleDeleteGroup: (node: NodeType) => void;
    handleDeleteSingleGroup(node: any): void;
    handleDelete: (data: DataType, node: NodeType) => void;
    onValuesChange: (changedValues: any, allValues: any) => void;
    getNamePath(changedValues: any): any[];
    componentDidUpdate(): void;
    onChange(value: any): void;
    /**
     * 渲染field
     */
    renderField(field: any, index: any, canDrag: any, path: any, key: any): JSX.Element;
    /**
     * icon actions 是否可点击
     */
    renderActions: (data: any) => JSX.Element;
    render(): JSX.Element;
}
