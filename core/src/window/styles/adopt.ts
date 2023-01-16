import { InjectorBase } from './base.js';

export class Adoptable extends InjectorBase {
  private adoptables: CSSStyleSheet[] | null = null;
  add(sheets: CSSStyleSheet[]) {
    if(this.adoptables == null) this.adoptables = [];
    for(let sheet of sheets) {
      let adoptable = new CSSStyleSheet();
      for(let rule of sheet.cssRules) {
        adoptable.insertRule(rule.cssText);
      }
      this.adoptables.push(adoptable);
    }
  }
  f(shadowRoot: ShadowRoot) {
    if(this.adoptables) {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ...this.adoptables];
    } 
    return shadowRoot;
  }
}

/*
export class Adoptable {
  private adoptables: CSSStyleSheet[] | null = null;
  constructor(private fritz: WindowFritz, private adopt: Array<string> | undefined){}

  add(sheets: CSSStyleSheet[]) {
    if(this.adoptables == null) this.adoptables = [];
    for(let sheet of sheets) {
      let adoptable = new CSSStyleSheet();
      for(let rule of sheet.cssRules) {
        adoptable.insertRule(rule.cssText);
      }
      this.adoptables.push(adoptable);
    }
  }

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
    return shadowRoot;
  }
}
*/