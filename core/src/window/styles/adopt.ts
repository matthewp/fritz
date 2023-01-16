import { InjectorBase } from './base.js';

export class Adoptable extends InjectorBase {
  private adoptables: CSSStyleSheet[] | null = null;
  add(sheet: CSSStyleSheet | string) {
    if(this.adoptables === null) this.adoptables = [];
    let adoptable = new CSSStyleSheet();
    if(typeof sheet === 'string') {
      adoptable.replaceSync(sheet);
    } else {
      for(let rule of sheet.cssRules) {
        adoptable.insertRule(rule.cssText);
      }
    }
    this.adoptables.push(adoptable);
  }
  f(shadowRoot: ShadowRoot) {
    if(this.adoptables) {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, ...this.adoptables];
    } 
    return shadowRoot;
  }
}