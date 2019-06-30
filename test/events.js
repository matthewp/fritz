import fritz from '../window.js';
import { waitForMount, waitFor } from './helpers.js';

customElements.define('special-el', class extends HTMLElement {
  connectedCallback() {
    requestAnimationFrame(_ => {
      let event = new CustomEvent('special', {
        detail: {foo: 'bar'}
      });
      this.dispatchEvent(event);
    });
  }

  set onspecial(val) {
    this.addEventListener('special', val);
  }
});

QUnit.module('Events', () => {
  fritz.use(new Worker('./events/app.js'));
  let eventEl, inputEl;

  QUnit.module('Basics', {
    async before() {
      eventEl = document.createElement('event-element');
      document.body.append(eventEl);
      await waitForMount(eventEl);
    },
    after() {
      eventEl.remove();
    }
  });

  QUnit.test('clicking a link changes the text', async assert => {
    let shadow = eventEl.shadowRoot;
    let anchor = shadow.querySelector('a');

    let spec = shadow.querySelector('#foo');
    assert.equal(spec.textContent, 'bar', 'This element was updated');

    // Custom events from child components to parents
    let thing = shadow.querySelector('#thing');
    assert.equal(thing.textContent, 'hello', 'This element updated');

    anchor.dispatchEvent(new Event('click'));
    await waitFor(() => shadow.querySelector('.clicked'));
  });

  QUnit.module('Inputs', {
    async before() {
      inputEl = document.createElement('input-el');
      document.body.append(inputEl);
      await waitForMount(inputEl);
    },
    after() {
      inputEl.remove();
    }
  });

  QUnit.test('Input events send the input\'s value', assert => {
    let done = assert.async();
    let shadow = inputEl.shadowRoot;
    let input = shadow.querySelector('input');
    let result = shadow.querySelector('.result');

    assert.equal(result.textContent, '');

    input.value = 'hello';
    input.dispatchEvent(new Event('keyup'));

    setTimeout(function(){
      assert.equal(result.textContent, 'hello');
      done();
    }, 50);
  });
});


/*
        describe('Basics', function(){
          const win = basicsFrame.contentWindow;
          const doc = basicsFrame.contentDocument;

          before(function(done) {
            setTimeout(done, 100);
          });


        });

        describe('Inputs', function(){
          const win = basicsFrame.contentWindow;
          const doc = basicsFrame.contentDocument;

          before(function(done) {
            setTimeout(done, 100);
          });


        });


        */