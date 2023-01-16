import type { WindowFritz, RemoteElement, Sheet } from "../../types";
import type { DefineMessage } from '../../message-types';

export abstract class InjectorBase {
  constructor(private fritz: WindowFritz, private styles: DefineMessage['styles']){}
  abstract add(sheet: CSSStyleSheet | string): void;
  abstract f(shadowRoot: ShadowRoot): DocumentFragment; 
  inject(shadowRoot: ShadowRoot): DocumentFragment {
    let { fritz } = this;
    if(fritz._sheets.length) {
      for(let sheet of fritz._sheets) {
        this.add(sheet);
      }
      fritz._sheets.length = 0;
    }
    if(this.styles) {
      for(let defn of this.styles) {
        if(typeof (defn as any).text === 'string') {
          this.add((defn as Sheet).text);
        } else {
          for(let el of shadowRoot.ownerDocument.querySelectorAll((defn as RemoteElement).selector)) {
            if((el as any).sheet) {
              this.add((el as any).sheet);
            }
          }
        }
      }
      this.styles = undefined;
    }
    return this.f(shadowRoot);
  }
}