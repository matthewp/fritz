import { InjectorBase } from './base.js';

export class Taggable extends InjectorBase {
  private adoptables: DocumentFragment | null = null;
  add(sheets: CSSStyleSheet[]) {
    if(this.adoptables == null) this.adoptables = document.createDocumentFragment();
    for(let sheet of sheets) {
      let adoptable = document.createElement('style');
      for(let rule of sheet.cssRules) {
        adoptable.textContent += rule.cssText;
      }
      this.adoptables.append(adoptable);
    }
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