import type { MountBase } from './types';
import type { WindowFritz } from '../types';
import { Adoptable, Taggable } from './styles/index.js';

type AdoptParam = Array<string> | undefined;

export function withStyles(fritz: WindowFritz, adopt: AdoptParam, Base: MountBase) {
  let Injector = ('adoptedStyleSheets' in document) ? Adoptable : Taggable;
  let injector = new Injector(fritz, adopt);

  return class extends Base {
    constructor() {
      super();
      this._root = injector.inject(this.shadowRoot);
    }
  }
}