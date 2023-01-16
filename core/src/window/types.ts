import type { Tree } from '../worker/tree';

export interface MountBase extends HTMLElement {
  new(): MountBase;
  connectedCallback(): void;
  disconnectedCallback(): void;
  shadowRoot: ShadowRoot;

  renderer?(): void;
  doRenderCallback(tree: Tree): void;
  addEventCallback(handle: number, b?: unknown): void;
  handleOrphanedHandles(handles: number[]): void;
  props: Record<string, any>;
  _worker: Worker;
  _id: number;
  _handlers: Record<string, any>;
  _root: DocumentFragment;
}