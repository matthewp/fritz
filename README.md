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
<html lang="en">
<title>My App</title>

<x-hello name="world"></x-hello>

<script type="module">
  import fritz from '//unpkg.com/fritz@next/window.js';

  fritz.use(new Worker('./worker.js'));
</script>
```

## Install

Using [Yarn](https://yarnpkg.com/en/):

```shell
yarn add fritz
```

Using npm:

```shell
npm install fritz
```

## License

BSD 2 Clause