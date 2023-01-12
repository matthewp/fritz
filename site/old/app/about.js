import html from './html.js';
import styles from './about.css';

const npmInstall = `
npm install fritz@next --save
`;

const yarnAdd = `
yarn add fritz@next
`;

function about() {
  return html`
    <section class="about">
      <style>${styles}</style>
      <h1 id="what-is-fritz">What is Fritz?</h1>
      <p><strong>Fritz</strong> is a UI library that allows you to define <em>components</em> that run inside of a <a href="https://www.w3.org/TR/workers/">Web Worker</a>. By running your application logic inside of a Worker, you can ensure that the main thread and scrolling are never blocked by expensive work you are doing. Fritz makes jank-free apps possible.</p>

      <p>Fritz plays nicely with frameworks. Since it is built on web components you can use Fritz just by adding a tag. Use Fritz within your <a href="https://facebook.github.io/react/">React</a>, <a href="https://vuejs.org/">Vue.js</a>, <a href="https://angular.io/">Angular</a>, or any other framework. If you have an expensive component that operates on a large dataset, this is a good candidate to turn into a Fritz component. Although you can create your entire app using Fritz (this page is), you don't have to.</p>

      <p>If you've heard of React's new version, <strong>Fiber</strong>, Fritz is in some ways an alternative. Fiber enables React to smartly schedule updates. Fritz allows for <em>parallel</em> updates. You're app can launch as many workers as you want and Fritz will use them all. The main thread only ever needs to apply changes. Due to this design, Fritz's scheduler is dead simple; it only needs to ensure that it applies only 16ms of work per frame. It can completely ignore the cost of user-code; that's free with Fritz.</p>

      <h1>Getting Started</h1>
      <h2>Installation</h2>

      <p>Install Fritz with npm:</p>
      <code-snippet lang="shell" code=${npmInstall}></code-snippet>

      <p>Or with Yarn:</p>
      <code-snippet lang="shell" code=${yarnAdd}></code-snippet>

      <h2>Using Fritz</h2>
      <p>Fritz lets you define <a href="https://www.webcomponents.org/introduction">web components</a> inside of a Web Worker. So, the first step to using Fritz is to create a Worker. Use <code>new Worker</code> to do so:</p>

      <code-snippet code=${`const worker = new Worker('./app.js');`}></code-snippet>

      <p>And then define a component inside of that worker. We'll assume you know how to configure your bundler tool and skip that part. But we should point out that you want to change your <a href="https://babeljs.io/">Babel</a> config so that it renders JSX to Fritz <code>h()</code> calls.</p>

      <code-snippet lang="json" code=${`
{
  "plugins": [
    ["transform-react-jsx", { "pragma":"h" }]
  ]
}
`}></code-snippet>

      <p>Then import all of the needed things and create a basic component:</p>

      <code-file name="app.js" code=${`
import fritz, { Component, h } from 'fritz';

class Hello extends Component {
  static get props() {
    return {
      name: { attribute: true }
    };
  }

  render({name}) {
    return <div>Hello {name}!</div>
  }
}

fritz.define('hello-message', Hello);
`}></code-file>

      <p>Cool, now that we have created a component we need to actually use it. Create another bundle named main.js, this will be a script we add to our page which will sync up the DOM to our component:</p>

      <code-file name="main.js" code=${`
import fritz from 'fritz/window';

const worker = new Worker('./app.js');
fritz.use(worker);
`}></code-file>

      <p>Now we just need to add this script to our page and use the component.</p>

      <code-file name="index.html" code=${`
<!doctype html>
<html lang="en">
<title>Our app</title>

<hello-message name="World"></hello-message>

<script type="module" src="./main.js"></script>
`}></code-file>

      <p>And that's it!</p>

      <h2>In a React app</h2>
      <p>Using Fritz components within a <a href="https://facebook.github.io/react/">React</a> application is simple. First step is to update your <code>.babelrc</code> to use h as the pragma:</p>
      <code-snippet code=${`
{
  "plugins": [
    ["transform-react-jsx", { "pragma":"h" }]
  ]
}
`}></code-snippet>

      <p>This will allow you to transform JSX both for the React and Fritz sides of your application. As before, we won't explain how to configure your bundler, but know that you will need to create a worker bundle (that contains Fritz code) and a bundle for your React code.</p>

      <p>React doesn't properly handle passing data to web components, but luckily there is a helper library that fixes the issue for us. Install <a href="https://github.com/skatejs/val">skatejs/val</a> like so:</p>
      <code-snippet lang="shell" code=${'npm install @skatejs/val'}></code-snippet>

      <p>Then create the module that will act as our wrapper:</p>

      <code-file name="val.js" code=${`
import React from 'react';
import val from '@skatejs/val';

export default val(React.createElement);
`}></code-file>

      <p>And within your React code, use it:</p>


      <code-file name="app.js" lang="jsx" code=${`
import React from 'react';
import ReactDOM from 'react-dom';
import fritz from 'fritz/window';
import h from './val.js';

fritz.use(new Worker('/worker.js'));

class Home extends React.Component {
  render() {
    return (
      <div>
        <span>Hello world</span>
        <worker-component name="Wilbur"></worker-component>
      </div>
    );
  }
}

const main = document.querySelector('main');
ReactDOM.render(<Home/>, main);
`}></code-file>
      <p>Note that this imports our implementation of <code>h</code>, which is just a small wrapper around <code>React.createElement</code>. Since we are using h in both the React app and the worker, our babel config remains the same.</p>

      <p>Now we just need to implement <code>${'<'}worker-component${'>'}</code>.</p>

      <code-file name="app.js" code=${`
import fritz, { Component, h } from 'fritz';

class MyWorkerComponent extends Component {
  static get props() {
    return {
      name: {}
    };
  }

  constructor() {
    super();
    this.state = { count: 0 };
  }

  add() {
    const count = this.state.count + 1;
    this.setState({count});
  }

  render({name}, {count}) {
    return (
      <section>
        <div>Hi {name}. This has been clicked {count} times.</div>
        <a href="#" onClick={this.add}>Add</a>
      </section>
    );
  }
}

fritz.define('worker-component', MyWorkerComponent);
`}></code-file>

      <p>A few things worth noting here:</p>
      <ul>
        <li>We define <strong>props</strong> that we expect to receive with a static <code>props</code> getter (of course you can use class properties here if using the Babel plugin).</li>
        <li><code>render</code> receives props and state as its arguments, so you can destruct.</li>
        <li>Unlike in React and Preact, you can directly pass your class methods as event handlers. Fritz will know to call your component as the <code>this</code> value when calling that function.</li>
        <li>As always, we finish out component by calling <code>fritz.define</code> to define the custom element tag name.</li>
      </ul>

      <p>And that's it! Now you can seemlessly use any Fritz components within your React application.</p>
    </section>
  `;
}

export default about;