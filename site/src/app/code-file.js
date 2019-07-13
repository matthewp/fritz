import fritz, { Component } from '../../../worker';
import html from './html.js';
import styles from './code-file.css';

class CodeFile extends Component {
  static get props() {
    return {
      code: { attribute: true },
      name: { attribute: true },
      lang: { attribute: true }
    }
  }

  render({code, lang, name}) {
    return html`
      <div>
        <style>${styles}</style>
        <div class="title">${name}</div>
        <code-snippet lang=${lang} code=${code}></code-snippet>
      </div>
    `;
  }
}

fritz.define('code-file', CodeFile);