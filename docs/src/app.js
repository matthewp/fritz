import fritz, { Component, h } from '../../worker';
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

<script src="./node_modules/fritz/window.umd.js"></script>
<script>
  fritz.use(new Worker('./worker.js'));
</script>
`;

function main() {
  return (
    <main>  
      <style>{styles}</style>

      <div class="intro">
        <header class="title">
          <h1>fritz</h1>
          <img class="fritz-flame" src="./frankenstein-fritz-flame.png" title="Fritz, with a flame" />
          <h2>Take your UI off the main thread.</h2>
        </header>

        <a class="github" href="https://github.com/matthewp/fritz">GitHub</a>

        <code-file name="worker.js" code={jsCode}></code-file>
        <code-file name="index.html" code={htmlCode}></code-file>
      </div>

      <footer>
        <p>Made with 🎃 by <a href="https://twitter.com/matthewcp">@matthewcp</a></p>
      </footer>
    </main>
  );
}

fritz.define('its-fritz-yall', main);