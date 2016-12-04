import App from './app.js';


export default function(tagName, attrName, attrValue) {
  if(tagName === 'form' && attrName === 'action') {
    return {
      'fritz-event': 'submit',
      'fritz-method': 'POST',
      'fritz-url': attrValue
    };
  }
}
