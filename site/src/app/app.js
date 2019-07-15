import fritz from 'fritz';
import About from './about.js';
import html from './html.js';
import styles from './app.css';
import './code-file.js';

// https://coolors.co/bac1b8-58a4b0-303030-0c7c59-d64933

const jsCode = `
class HelloMessage extends Component {
  static props = {
    name: { attribute: true }
  }

  render() {
    return (
      <div>Hello {this.name}!</div>
    );
  }
}

fritz.define('hello-message', HelloMessage);
`;

const htmlCode = `
<hello-message name="World"></hello-message>

<script type="module">
  import fritz from 'https://unpkg.com/fritz@next/window.js';

  fritz.use(new Worker('./worker.js'));
</script>
`;

function main() {
  return html`
    <main>  
      <style>${styles}</style>

      <section class="intro shadow-section">
        <header class="title">
          <h1 class="primary-title">Fritz</h1>
          <picture>
            <source srcset="./frankenstein-fritz-flame.webp" type="image/webp"/>
            <source srcset="./frankenstein-fritz-flame.png" type="image/jpeg"/>
            <img src="./frankenstein-fritz-flame.png" class="fritz-flame" title="Fritz, with a flame"/>
          </picture>
          <h2>Take your UI off the main thread.</h2>
        </header>

        <a class="github" href="https://github.com/matthewp/fritz">GitHub</a>

        <code-file name="worker.js" lang="js" code=${jsCode}></code-file>
        <code-file name="index.html" lang="html" code=${htmlCode}></code-file>
      </section>

      ${About()}

      <footer>
        <p>Made with 🎃 by <a href="https://twitter.com/matthewcp">@matthewcp</a></p>
      </footer>
    </main>
  `;
}

fritz.define('its-fritz-yall', main);