import type { WindowFritz } from "../../types";

export abstract class InjectorBase {
  constructor(private fritz: WindowFritz, private adopt: Array<string> | undefined){}
  abstract add(sheets: CSSStyleSheet[]): void;
  abstract f(shadowRoot: ShadowRoot): DocumentFragment; 
  inject(shadowRoot: ShadowRoot): DocumentFragment {
    let { fritz } = this;
    if(fritz._sheets.length) {
      this.add(fritz._sheets);
      fritz._sheets.length = 0;
    }
    if(this.adopt) {
      let sheets: CSSStyleSheet[] = [];
      for(let selector of this.adopt) {
        for(let el of shadowRoot.ownerDocument.querySelectorAll(selector)) {
          if((el as any).sheet) {
            sheets.push((el as any).sheet);
          }
        }
      }
      this.add(sheets);
      this.adopt = undefined;
    }
    return this.f(shadowRoot);
  }
}