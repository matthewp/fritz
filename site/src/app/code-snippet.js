import fritz, { Component } from 'fritz';
import html from './html.js';
import highlight from './hlight.js';
import styles from './agate.css';

class CodeSnippet extends Component {
  static get props() {
    return {
      code: { attribute: true },
      name: { attribute: true },
      lang: { attribute: true }
    };
  }

  render({ code, lang = 'js' }) {
    let classes = `hljs ${lang}`;

    return html`
      <div>
        <style>${styles}</style>
        <pre>
          <code class=${classes}>${highlight(code.trim(), lang)}</code>
        </pre>
      </div>
    `;
  }
}

fritz.define('code-snippet', CodeSnippet);