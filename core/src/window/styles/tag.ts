import { InjectorBase } from './base.js';

// TODO remove when adoptedStylesheets has good browser support.
export class Taggable extends InjectorBase {
  private adoptables: DocumentFragment | null = null;
  add(sheet: CSSStyleSheet | string) {
    if(this.adoptables == null) this.adoptables = document.createDocumentFragment();
    let adoptable = document.createElement('style');
    if(typeof sheet === 'string') {
      adoptable.textContent = sheet;
    } else {
      for(let rule of sheet.cssRules) {
        adoptable.textContent += rule.cssText;
      }
    }
    this.adoptables.append(adoptable);
  }
  f(shadowRoot: ShadowRoot) {
    if(this.adoptables) {
      let frag = this.adoptables.cloneNode(true);

      let root = document.createDocumentFragment();
      root.append(...shadowRoot.childNodes);

      // Fake being a shadowroot
      Object.defineProperties(root, {
        insertBefore: {
          value: shadowRoot.insertBefore.bind(shadowRoot)
        },
        removeChild: {
          value: shadowRoot.removeChild.bind(shadowRoot)
        }
      });

      // Insert styles
      shadowRoot.prepend(frag);
      return root;
    }
    return shadowRoot;
  }
}