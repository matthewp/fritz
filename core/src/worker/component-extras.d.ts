export as namespace fritz;

import { default as Component, ComponentConstructor } from './component';

export type {
  Component
};

export type Key = string | number | any;

export interface VNode<P = {}> {
	type: ComponentType<P> | string;
	props: P & { children: ComponentChildren };
	key: Key;
}

export interface Attributes {
	key?: Key;
	jsx?: boolean;
}

export type ComponentChild =
	| VNode<any>
	| object
	| string
	| number
	| bigint
	| boolean
	| null
	| undefined;

export type ComponentChildren = ComponentChild[] | ComponentChild;

export type ComponentType<P = {}> = ComponentConstructor<P>;

export interface FritzDOMAttributes {
	children?: ComponentChildren;
}