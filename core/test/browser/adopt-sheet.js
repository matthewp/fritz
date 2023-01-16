import fritzWindow from "../../window.mjs";
import { Component, h, adopt } from "../../worker.mjs";
import { waitForRender, hooks } from "./helpers.js";

QUnit.module('Adoptable sheets', hooks);

QUnit.test('can use a <style> element', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let style = document.createElement('style');
  style.id = 'adopted-one';
  style.textContent = `.adopted-one { color: red; }`;
  document.head.append(style);
  fritzWorker.define('adopt-style', class extends Component {
    static styles = [adopt('#adopted-one')];
    render() {
      return h('div', { class: 'adopted-one' }, 'worked!');
    }
  });
  await customElements.whenDefined('adopt-style');
  let el = document.createElement('adopt-style');
  document.querySelector('#qunit-fixture').append(el);
  await waitForRender(el);

  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(255, 0, 0)');
  style.remove();
});

QUnit.test('can use a <link> element', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let url = URL.createObjectURL(new Blob([`.adopted-two { color: blue; }`], { type: 'text/css' }));
  let link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.id = 'adopted-two';
  link.href = url;
  document.head.append(link);
  await new Promise(resolve => {
    link.addEventListener('load', () => resolve());
  });

  fritzWorker.define('adopt-style-2', class extends Component {
    static styles = [adopt('#adopted-two')];
    render() {
      return h('div', { class: 'adopted-two' }, 'worked!');
    }
  });
  await customElements.whenDefined('adopt-style-2');
  let el = document.createElement('adopt-style-2');
  document.querySelector('#qunit-fixture').append(el);
  await waitForRender(el);

  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(0, 0, 255)');
  link.remove();
});

QUnit.test('can be globally defined', async assert => {
  let { fritzWorker } = assert.test.testEnvironment;
  let style = document.createElement('style');
  style.id = 'adopted-three';
  style.textContent = `.adopted-three { color: yellow; }`;
  document.head.append(style);
  fritzWindow.adopt(style);
  fritzWorker.define('adopt-style-3', class extends Component {
    render() {
      return h('div', { class: 'adopted-three' }, 'worked!');
    }
  });
  await customElements.whenDefined('adopt-style-3');
  let el = document.createElement('adopt-style-3');
  document.querySelector('#qunit-fixture').append(el);
  await waitForRender(el);

  let styles = getComputedStyle(el.shadowRoot.querySelector('div'));
  assert.equal(styles.color, 'rgb(255, 255, 0)');
  style.remove();
})