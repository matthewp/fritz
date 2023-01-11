import fritz, { Component, h } from '../../';

// Note that this test is not yet working.
// https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wG4Aoc4AOxiSk3STgGFdJqlaAeABTgC8cAN4BfAHwjycGXDTsInWgHVgAGzXI0SYADckvHGADOACjBHjALji8AlDd0RgAEwqy4xgBYQArmpc2cEUuGABVMBcUOnNLG3sbACMICDVUandZeWClGAARVwBZP1pTBzgnVwpRchRE4xgodHg0NRRjY1YFXL5JYWksxQaoXwxoMpEajzrh5rgiahd6WIgTePKUagBPasoYLbBmQ1XOoX6PahQQJBthmgBzaopyVvbOwq2AFS8HuCQADzoi06QQ4oT4lj6AxkCyWUBWJjsUg8HiIMF8UGocG4Lj04joDQe3AA9LjdOJMjIaqIgA
// I this this is a bug: https://github.com/microsoft/TypeScript/issues/23911

type Props = {
  name: string;
}

class MyThing extends Component<Props> {
  render(props: Props) {
    props.name;
    return (
      <div>testing</div>
    );
  }
}

fritz.define('some-thing', MyThing);