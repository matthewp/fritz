import fritz, { Component, html } from '../../worker';
import styles from './code-file.css';

class CodeFile extends Component {
  static get props() {
    return {
      code: 'string',
      name: { type: 'string', attribute: true }
    }
  }

  render({code, name}) {
    
    return html`
      <div>
        <style>${styles}</style>
        <div class="title">${name}</div>
        <code-snippet .code=${code}></code-snippet>
      </div>
    `;
  }
}

fritz.define('code-file', CodeFile);
