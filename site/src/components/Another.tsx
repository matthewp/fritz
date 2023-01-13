import fritz, { Component } from 'fritz';

export default class Another extends Component {
  render() {
    return (
      <div>
       Another Component
      </div>
    );
  }
}

fritz.define('my-another', Another);