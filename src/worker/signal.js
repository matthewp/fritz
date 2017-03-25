//import App from './app.js';
import Handle from './handle.js';

const eventAttrExp = /^on[A-Z]/;

function signal(tagName, attrName, attrValue, attrs) {
  if(eventAttrExp.test(attrName)) {
    let eventName = attrName.toLowerCase();
    let id = Handle.from(attrValue).id;
    return [1, eventName, id];
  }
}

export default signal;
