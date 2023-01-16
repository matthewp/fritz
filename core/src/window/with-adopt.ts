import type { MountBase } from './types';
import type { WindowFritz } from '../types';

type AdoptParam = Array<string> | undefined;

export function withAdopt(fritz: WindowFritz, _adopt: AdoptParam, Base: MountBase) {
  let adoptables: null | CSSStyleSheet[] = null;
  let adopt = _adopt;
  
  function addSheetsToAdoptables(sheets: CSSStyleSheet[]) {
    if(adoptables == null) adoptables = [];
    for(let sheet of sheets) {
      let adoptable = new CSSStyleSheet();
      for(let rule of sheet.cssRules) {
        adoptable.insertRule(rule.cssText);
      }
      adoptables.push(adoptable);
    }
  }

  return class extends Base {
    constructor() {
      super();

      if(fritz._sheets.length) {
        addSheetsToAdoptables(fritz._sheets);
        fritz._sheets.length = 0;
      }

      if(adopt) {
        let sheets: CSSStyleSheet[] = [];
        for(let selector of adopt) {
          for(let el of this.ownerDocument.querySelectorAll(selector)) {
            if((el as any).sheet) {
              sheets.push((el as any).sheet);
            }
          }
        }
        addSheetsToAdoptables(sheets);
        adopt = undefined;
      }

      if(adoptables) {
        this.shadowRoot!.adoptedStyleSheets = [...this.shadowRoot!.adoptedStyleSheets, ...adoptables];
      }      
    }
  }
}