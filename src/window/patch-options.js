import {
  set as setEventData,
  del as delEventData
} from './event-data.js';

export default class {
  constructor(framework) {
    this.framework = framework;
  }

  addedProp(node, name, value, props) {
    if(name === 'fritz-event') {
      let url = props['fritz-url'];
      let method = props['fritz-method'];
      setEventData(node, value, {
        method: method || 'POST',
        url: url
      });
      node.addEventListener(value, this.framework.eventHandler);
    }

    if(name === 'action') {

    }
  }

  removedProp(node, name) {
    // TODO remove the event (how) ?
  }

  removed(node){
    delEventData(node);
  }
}
