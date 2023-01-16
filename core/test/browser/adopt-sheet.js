import fritzWindow from "../../window.mjs";
import fritzWorker, { Component, h } from "../../worker.mjs";
import { waitForRender } from "./helpers.js";

let channel;

QUnit.module('Adoptable sheets', {
  before() {
    this.previousPort = fritzWorker._port;
    channel = new MessageChannel();
    channel.port1.start();
    channel.port2.start();
    fritzWorker._port = channel.port2;
    fritzWindow.use(channel.port1);
  },
  after() {
    document.querySelector('#qunit-fixture').innerHTML = '';
    fritzWorker._port = this.previousPort;
  }
});

QUnit.test('can use a <style> element', async assert => {
  let style = document.createElement('style');
  style.id = 'adopted-one';
  style.textContent = `.adopted-one { color: red; }`;
  document.head.append(style);
  fritzWorker.define('adopt-style', class extends Component {
    static adopt = ['#adopted-one'];
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
    static adopt = ['#adopted-two'];
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