[![npm version](https://badge.fury.io/js/fritz.svg)](http://badge.fury.io/js/fritz)

# fritz

A library for rendering custom elements in a web worker.

**worker.js**

```js
import { Component, html } from 'fritz';

class Hello extends Component {
  static get props() {
    return {
      name: { attribute: true }
    }
  }

  render({name}) {
    return html`
      <span>Hello ${name}</span>
    `;
  }
}

fritz.define('x-hello', Hello);
```

**index.html**

```html
<!doctype html>

<x-hello name="world"></x-hello>

<script type="module">
  import fritz from 'https://unpkg.com/fritz/window.js';

  fritz.use(new Worker("./worker.js"));
</script>
```

## Install

__Yarn__

```shell
yarn add fritz
```

__npm__

```shell
npm install fritz
```

## License

BSD 2 Clause