import fritz, { Component, h, Fragment } from '../../../';

type Props = {
  name: string;
}

class MyThing extends Component<Props> {
  render(props: Props) {
    props.name;
    return (
      <Fragment>
        <div>Fragment content</div>
      </Fragment>
    );
  }
}

fritz.define('some-thing', MyThing);