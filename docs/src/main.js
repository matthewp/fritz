import fritz from '../../window';
import styles from './agate.css';
import './hljs.js';

const { highlightBlock } = self.hljs;

class CodeSnippet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._rendered = false;
  }

  static get observedAttributes() {
    return ['code'];
  }
  
  connectedCallback() {
    if(!this._rendered) {
      this._rendered = true;
      let root = this.shadowRoot;
      let doc = this.ownerDocument;

      let style = doc.createElement('style');
      style.textContent = styles;
      root.appendChild(style);

      let pre = doc.createElement('pre');
      pre.appendChild(doc.createElement('code'));
      root.appendChild(pre);
      this._renderCode();
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    this[name] = newVal;
  }

  set code(val) {
    // Remove loading newline
    this._code = val[0] === '\n' ? val.substr(1) : val;
    this._renderCode();
  }

  _renderCode() {
    let code = this.shadowRoot.querySelector('code');
    if(this._code && code) {
      let tn = this.ownerDocument.createTextNode(this._code);
      clear(code);
      code.appendChild(tn);
      highlightBlock(code);
    }
  }
}

function clear(node) {
  while(node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

customElements.define('code-snippet', CodeSnippet);

fritz.use(new Worker('./app.js'));
