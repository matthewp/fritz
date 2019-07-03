import fritz from '../../window';
import styles from './agate.css';
import hljs from './hljs.js';

class CodeSnippet extends HTMLElement {
  static get observedAttributes() {
    return ['code'];
  }
  
  connectedCallback() {
    if(!this.shadowRoot) {
      let root = this.attachShadow({mode:'open'});
      let doc = this.ownerDocument;

      let style = doc.createElement('style');
      style.textContent = styles;
      root.appendChild(style);

      let pre = doc.createElement('pre');
      pre.appendChild(doc.createElement('code'));
      root.appendChild(pre);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
  }

  set code(val) {
    // Remove loading newline
    this._code = val[0] === '\n' ? val.substr(1) : val;
    let tn = this.ownerDocument.createTextNode(this._code);
    let code = this.shadowRoot.querySelector('code');
    code.appendChild(tn);
    hljs.highlightBlock(code);
  }
}

customElements.define('code-snippet', CodeSnippet);

fritz.use(new Worker('./app.js'));