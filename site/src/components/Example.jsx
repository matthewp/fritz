import fritz, { Component } from 'fritz';

export default class Example extends Component {
  render() {
    return (
      <div class="grid place-items-center h-screen content-center">
        Here we are!
        <a href="/markdown-page" class="p-4 underline">Markdown is also supported...</a>
      </div>
    );
  }
}

fritz.define('my-example', Example);

