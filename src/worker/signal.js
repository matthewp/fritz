import App from './app.js';


export default function(tagName, attrName, attrValue) {
  if(tagName === 'form' && attrName === 'action') {
    return [1, 'onsubmit', attrName];
  }
}
