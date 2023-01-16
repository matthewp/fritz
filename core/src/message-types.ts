import type { PropDefinitions, RemoteEvent } from './types';
import type { Tree } from './worker/tree';

export const DEFINE = 'fritz:define';
export const TRIGGER = 'fritz:trigger';
export const RENDER = 'fritz:render';
export const EVENT = 'fritz:event';
export const STATE = 'fritz:state';
export const DESTROY = 'fritz:destroy';
export const RENDERED = 'fritz:rendered';
export const CLEANUP = 'fritz:cleanup';


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
  adopt: Array<string> | undefined;
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