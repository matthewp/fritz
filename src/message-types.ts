import type { PropDefinitions, RemoteEvent } from './types';
import type { Tree } from './worker/tree';

export const DEFINE = 'define';
export const TRIGGER = 'trigger';
export const RENDER = 'render';
export const EVENT = 'event';
export const STATE = 'state';
export const DESTROY = 'destroy';
export const RENDERED = 'rendered';
export const CLEANUP = 'cleanup';


// Window defined
export type WindowRenderMessage = {
  type: typeof RENDER;
  tag: string;
  id: number;
  props: Record<string, any>;
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

export type StateMessage = {
  type: typeof STATE;
  state: any;
};

export type DestroyMessage = {
  type: typeof DESTROY;
  id: number;
};

export type RenderedMessage = {
  type: typeof RENDERED;
  id: number;
};

export type CleanupMessage = {
  type: typeof CLEANUP;
  id: number;
  handles: Array<number>;
};

export type MessageSentFromWindow = WindowRenderMessage | EventMessage | StateMessage | DestroyMessage | RenderedMessage | CleanupMessage;

// Worker Defined
export type DefineMessage = {
  type: typeof DEFINE;
  tag: string;
  props: PropDefinitions | undefined;
  events: Array<string> | undefined;
  features: {
    mount: boolean;
  };
};

export type TriggerMessage = {
  type: typeof TRIGGER;
  event: RemoteEvent;
  id: number;
};

export type WorkerRenderMessage = {
  type: typeof RENDER;
  id: number;
  tree: Tree;
};

export type MessageSentFromWorker = DefineMessage | TriggerMessage | WorkerRenderMessage;