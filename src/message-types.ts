import type { PropDefinitions } from './types';

export const DEFINE = 'define';
export const TRIGGER = 'trigger';
export const RENDER = 'render';
export const EVENT = 'event';
export const STATE = 'state';
export const DESTROY = 'destroy';
export const RENDERED = 'rendered';
export const CLEANUP = 'cleanup';

export type DefineMessage = {
  type: typeof DEFINE,
  tag: string,
  props: PropDefinitions,
  events: Array<string>,
  features: {
    mount: boolean;
  };
};

export type EventMessage = {
  type: typeof EVENT;
  event: {
    type: string;
    detail: any;
    value: string;
  };
  id: number;
  handle: number | undefined;
};

export type WindowRenderMessage = {
  type: typeof RENDER,
  tag: string,
  id: number,
  props: Record<string, any>;
};

export type WorkerRenderMessage = {

};