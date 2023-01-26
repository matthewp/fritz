import fritzWindow from "../../window.mjs";
import { Component, h, adopt } from "../../worker.mjs";
import { waitForRender, fixture, setupTest } from "./helpers.js";

QUnit.module('getSnapshotBeforeUpdate', hooks => {
  setupTest(hooks);

  QUnit.test('mount called on first render, componentDidUpdate called on re-renders', async assert => {
    let { fritzWorker } = assert.test.testEnvironment;
  
    let mountCount = 0, updateCount = 0;
    let tag = 'get-snapshot-1';
    fritzWorker.define(tag, class extends Component {
      static props = { name: { attribute: false } };
      componentDidMount() {
        mountCount++;
      }
      componentDidUpdate() {
        updateCount++;
      }
      render() {
        return h('div', null, `Hello ${this.props.name || 'world'}`);
      }
    });
    await customElements.whenDefined(tag);
    let el = document.createElement(tag);
    fixture().append(el);
    await waitForRender(el);

    el.name = 'Wilbur';
    await waitForRender(el);

    assert.equal(el.shadowRoot.firstElementChild.textContent, 'Hello Wilbur');
    assert.equal(mountCount, 1, 'componentDidMount called');
    assert.equal(updateCount, 1, 'componentDidUpdate called');
  });

  QUnit.test('getSnapshotBeforeUpdate gets old props', async assert => {
    let { fritzWorker } = assert.test.testEnvironment;
  
    let tag = 'get-snapshot-2';
    fritzWorker.define(tag, class extends Component {
      static props = { foo: { attribute: true } };
      getSnapshotBeforeUpdate(prevProps) {
        if(prevProps.foo === 'bar') {
          return { oldName: 'bar' };
        }
      }
      componentDidUpdate(prevProps, prevState, snapshot) {
        if(snapshot?.oldName) {
          this.setState({
            oldName: snapshot.oldName
          });
        }
      }
      render() {
        let msg = this.state.oldName ? `Bye ${this.state.oldName}` : `Foo bar`;
        return h('div', null, msg);
      }
    });
    await customElements.whenDefined(tag);
    let el = document.createElement(tag);
    el.setAttribute('foo', 'bar');
    fixture().append(el);
    await waitForRender(el);
    assert.equal(el.shadowRoot.firstElementChild.textContent, 'Foo bar');

    el.foo = 'baz';
    await waitForRender(el);
    await waitForRender(el);

    assert.equal(el.shadowRoot.firstElementChild.textContent, 'Bye bar');
  });
});