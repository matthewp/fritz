import fritz, { Component, h } from '../../';

// Note that this test is not yet working.

type Props = {
  name: string;
}

class MyThing extends Component<Props> {
  render(props) {
    props.name;
    return (
      <div>testing</div>
    );
  }
}

fritz.define('some-thing', MyThing);