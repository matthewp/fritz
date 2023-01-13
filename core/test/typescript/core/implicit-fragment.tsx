import fritz, { Component, h, Fragment } from '../../../';

type Props = {
  name: string;
}

class MyThing extends Component<Props> {
  render(props: Props) {
    props.name;
    return (
      <>
        <div>Fragment content</div>
      </>
    );
  }
}

fritz.define('some-thing', MyThing);