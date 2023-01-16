import type { MountBase } from './types';
import type { WindowFritz } from '../types';
import type { DefineMessage } from '../message-types';
import { Adoptable, Taggable } from './styles/index.js';

type AdoptParam = Array<string> | undefined;

export function withStyles(fritz: WindowFritz, styles: DefineMessage['styles'], Base: MountBase) {
  let Injector = ('adoptedStyleSheets' in document) ? Adoptable : Taggable;
  let injector = new Injector(fritz, styles);

  return class extends Base {
    constructor() {
      super();
      this._root = injector.inject(this.shadowRoot);
    }
  }
}