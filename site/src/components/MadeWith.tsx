import fritz, { Component } from 'fritz';

export default class MadeWith extends Component {
  static styles = `
    p {
      margin: 0;
    }
      
    a,
    a:visited {
      color: #fff;
      font-weight: 600;
    }
  `;
  render() {
    return (
      <>
        <p>Made with 🎃 by <a href="https://twitter.com/matthewcp">@matthewcp</a></p>
      </>
    );
  }
}

fritz.define('fritz-made-with', MadeWith);