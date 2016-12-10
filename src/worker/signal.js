import App from './app.js';


export default function(tagName, attrName, attrValue, attrs) {
  switch(attrName) {
    /*case 'fritz-event':
      return [1, 'on' + attrValue, s.url(attrs), s.url(attrs)];*/
    case 'action':
      if(tagName === 'form') {
        let eventName = s.event(attrs) || 'submit';
        let method = s.method(attrs) || attrs['method'];
        return [1, 'on' + eventName, attrValue, method];
      }
      break;
    case 'href':
      if(tagName === 'a' && App.hasMatchingRoute('GET', attrValue)) {
        return [1, 'onclick', attrValue, 'GET'];
      }
      break;
  }
}

const s = ['event', 'url', 'method'].reduce(function(o, n){
  var prop = 'data-' + n;
  o[n] = function(attrs){
    return attrs[prop];
  };
  return o;
}, {});
