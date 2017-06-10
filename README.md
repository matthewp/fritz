# fritz

A library for rendering custom elements in a web worker.

**worker.js**

```js
import { Component, h } from 'fritz';

class Hello extends Component {
  static get props() {
    return {
      name: { attribute: true }
    }
  }

  render({name}) {
    return (
      <span>Hello {name}</span>
    );
  }
}

fritz.define('x-hello', Hello);
```

**index.html**

```html
<!doctype html>

<x-hello name="world"></x-hello>

<script src="../node_modules/fritz/window.umd.js"></script>
<script>
  fritz.use(new Worker("./worker.js"));
</script>
```

## Install

```shell
yarn add fritz
```

## License

BSD 2 Clause