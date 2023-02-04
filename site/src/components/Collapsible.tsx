// @jsxPragma h
import fritz, {Component} from 'fritz';
import ButtonCSS from '../styles/button.css?raw';

type State = {
  open: boolean | undefined;
}

const SSR = import.meta.env.SSR;

export default class Collapsible extends Component<any, State> {
  static props = {
    queryMatches: { attribute: false }
  }
  static styles = [ButtonCSS,  /* css */`
    .area:not(.open) {
      display: none;
    }
    .root:not(.matches) .selector {
      display: none;
    }

    .selector {
      display: grid;
      justify-content: center;
      margin-bottom: 1rem;
    }

    button {
      --button-font-size: 110%;
    }

    @media (max-width: 420px) {
      .root:not(.client) .area {
        display: none;
      }
    }
  `];
  state = {
    open: undefined
  };
  onButtonClick() {
    this.setState({ open: !this.state.open });
  }
  render() {
    let client = !SSR;
    let matches = client && (this.props.queryMatches ?? true);
    let open = this.state.open ?? !matches;
    let rootClasses = ["root"];
    if(matches) rootClasses.push("matches");
    if(client) rootClasses.push("client");
    
    return (
      <div class={rootClasses.join(' ')}>
        <div class="selector">
          <button type="button" class="button" onClick={this.onButtonClick}>Menu</button>
        </div>
        <div class={'area' + (open ? ' open' : '')}>
        <slot></slot>
        </div>
      </div>
    );
  }
}

fritz.define('x-collapse', Collapsible);