import fritz, {Component, h} from '../../worker.js';
import styles from './side-menu.css';

class SideMenu extends Component {
  constructor() {
    super();
    this.open = false;
  }

  toggle() {
    this.open = !this.open;
  }

  maybeClose() {
    if(this.open) this.open = false;
  }

  render({open}) {
    var wrapperClasses = 'wrapper' + (open ? ' open' : '');
    
    return (
      <div class={wrapperClasses}>
        <style>{styles}</style>
        <div class="menu">
          <slot name="menu"></slot>
        </div>
        <a class="hamburger" href="#" onClick={this.toggle}>☰</a>
        <div class="content" onClick={this.maybeClose}>
          <slot name="content"></slot>
        </div>
      </div>
    );
  }
}

fritz.define('side-menu', SideMenu);