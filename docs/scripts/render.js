import { renderToString } from '../../src/node/index.js';
import { h } from '../../worker';
import htm from 'htm';
import '../src/app.js';

const html = htm.bind(h);

let out = renderToString(html`<its-fritz-yall></its-fritz-yall>`);

console.log(`<!doctype html>
<!doctype html>
<html lang="en">
<title>Fritz - Take your UI off the main thread</title>
<link rel="preload" href="./app.js" as="worker">
<link rel="preload" href="./main.js" as="script">
<link rel="manifest" href="./manifest.json">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, minimal-ui">
<meta name="theme-color" content="#58A4B0"/>
<link rel="shortcut icon" href="/favicon.ico">
<script>
customElements.define('f-shadow', class extends HTMLElement {
  connectedCallback() {
    let p = this.parentNode, t = p.firstElementChild;
    this.remove();
    p.attachShadow({ mode: 'open' }).append(t.content.cloneNode(true));
  }
});
</script>
<style>
  :root {
    --gray: #BAC1B8;
    --cadetblue: #58A4B0;
    --jet: #303030;
    --cyan: #0C7C59;
    --vermilion: #D64933; 
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Open Sans', sans-serif;
    font-weight: 100;
    background-color: var(--gray);
    margin: 0;
  }
</style>

${out}

<script src="./main.js"></script>

<noscript>
  <h1>Oops!</h1>
  <p>It looks like you have JavaScript turned off. Since this is a website about a JavaScript library there's no reason to have it off.</p>
</noscript>
`);