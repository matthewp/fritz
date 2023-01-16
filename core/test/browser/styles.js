import fritzWorker, { Component, h, css, adopt } from "../../worker.mjs";
import { waitForRender, hooks, fixture } from "./helpers.js";

QUnit.module('Styles', hooks);

QUnit.test('can take a string', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let tag = 'styles-1';
  fritzWorker.define(tag, class extends Component {
    static styles = `
      div {
        color: red;
      }
    `;
    render() {
      return h('div', null, 'worked!');
    }
  });
  await customElements.whenDefined(tag);
  let el = document.createElement(tag);
  fixture().append(el);
  await waitForRender(el);
  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(255, 0, 0)');
});

QUnit.test('can take a css function', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let tag = 'styles-2';
  fritzWorker.define(tag, class extends Component {
    static styles = css`
      div {
        color: red;
      }
    `;
    render() {
      return h('div', null, 'worked!');
    }
  });
  await customElements.whenDefined(tag);
  let el = document.createElement(tag);
  fixture().append(el);
  await waitForRender(el);
  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(255, 0, 0)');
});

QUnit.test('can take an array of styles and adopted styles', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let tag = 'styles-3';
  let style = document.createElement('style');
  style.id = 'adopted-style-3';
  style.textContent = `.adopted-style-3 { background: blue; }`;
  document.head.append(style);
  fritzWorker.define(tag, class extends Component {
    static styles = [
      adopt('#adopted-style-3'),
      css`
        div {
          color: red;
        }
      `
    ];
    render() {
      return h('div', {'class':'adopted-style-3'}, 'worked!');
    }
  });
  await customElements.whenDefined(tag);
  let el = document.createElement(tag);
  fixture().append(el);
  await waitForRender(el);
  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(255, 0, 0)');
  assert.equal(styles.backgroundColor, 'rgb(0, 0, 255)');
  style.remove();
});