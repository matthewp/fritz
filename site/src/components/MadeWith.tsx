import fritz, { Component } from 'fritz';

const styles = `
p {
  margin: 0;
}
  
a,
a:visited {
  color: #fff;
  font-weight: 600;
}
`

export default class MadeWith extends Component {
  render() {
    return (
      <>
        <style>{styles}</style>
        <p>Made with 🎃 by <a href="https://twitter.com/matthewcp">@matthewcp</a></p>
      </>
    );
  }
}

fritz.define('fritz-made-with', MadeWith);