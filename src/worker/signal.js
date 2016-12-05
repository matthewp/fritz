import App from './app.js';


export default function(tagName, attrName, attrValue, attrs) {
  switch(attrName) {
    case 'fritz-event':
      return [1, 'on' + attrValue, getUrl(attrs), getMethod(attrs)];
    case 'action':
      if(tagName === 'form') {
        return [1, 'onsubmit', attrName];
      }
      break;
  }
}

function getUrl(attrs) {
  return attrs['fritz-url'];
}

function getMethod(attrs) {
  return attrs['fritz-method'];
}
