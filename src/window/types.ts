export interface MountBase extends HTMLElement {
  new(): MountBase;
  connectedCallback(): void;
  disconnectedCallback(): void;
  shadowRoot: ShadowRoot;

  renderer?(): void;
  props: Record<string, any>;
  _worker: Worker;
  _id: number;
  _handlers: Record<string, any>;
}