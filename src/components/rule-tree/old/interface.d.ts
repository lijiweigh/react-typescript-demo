import { ReactElement, ReactFragment, CSSProperties } from 'react';
import { StoreValue } from 'rc-field-form/es/interface';
export interface Value {
    relation: string;
    children: StoreValue;
    [key: string]: StoreValue;
}
export interface Relation {
    text: string;
    value: string | number;
}
export interface Field {
    id: string;
    rules?: BaseRule[];
    element?: ReactElement;
    render?: (ctx: DepContext) => ReactElement;
}
export interface RuleTreeProps {
    fields: Field[];
    value: Value;
    onChange: (value: Value) => void;
    relations?: Relation[];
    rootRelations?: Relation[];
    cascades?: string[];
    onCascade?: (ctx: DepContext) => void;
    disabled: boolean;
    style: CSSProperties;
    className: string;
    canAddCondition?: (data: DataType) => boolean;
    canAddConditionGroup?: (data: DataType) => boolean;
}
export interface DepContext {
    id: string;
    key: string;
    value: StoreValue;
    getValue: (id: string) => StoreValue;
    setValues: (id: string | {
        [key: string]: StoreValue;
    }, value?: StoreValue) => void;
}
export interface DataType {
    type: 'relation' | 'leaf' | 'action';
    key: number;
    path: string[];
    parentPath: string[];
    index: number;
    level: number;
}
export interface NodeType {
    parent: NodeType;
    children: NodeType[];
    x: number;
    y: number;
    data: DataType;
    depth: number;
}
export interface DragItem {
    x: number;
    y: number;
    data: DataType;
}
export interface DropProps {
    canDrag: boolean;
    data: DataType;
    node: NodeType;
    onDrop: (drop: DropProps, drag: DragProps) => void;
    x: number;
    y: number;
    connectDropTarget?: (target: HTMLDivElement) => ReactElement;
    isOver?: boolean;
    canDrop?: boolean;
    type: string;
}
export interface DragProps {
    children: ReactFragment;
    data: DataType;
    node: NodeType;
    x: number;
    y: number;
    isDragging?: boolean;
    connectDragSource?: (source: ReactElement) => ReactElement;
    connectDragPreview?: (preview: ReactElement) => ReactElement;
    type: string;
}
export interface LinkProps {
    source: {
        x: number;
        y: number;
    };
    target: {
        x: number;
        y: number;
    };
    highlight?: boolean;
}
interface ArrayRule extends Omit<BaseRule, 'type'> {
    type: 'array';
    defaultField?: RuleObject;
}
export declare type RuleObject = BaseRule | ArrayRule;
export declare type RuleType = 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email';
declare type Validator = (rule: RuleObject, value: Value, callback: (error?: string) => void) => Promise<void> | void;
interface BaseRule {
    enum?: any[];
    len?: number;
    max?: number;
    message?: string | ReactElement;
    min?: number;
    pattern?: RegExp;
    required?: boolean;
    transform?: (value: any) => any;
    type?: RuleType;
    validator?: Validator;
    whitespace?: boolean;
    /** Customize rule level `validateTrigger`. Must be subset of Field `validateTrigger` */
    validateTrigger?: string | string[];
}
export {};
