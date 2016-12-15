import App from './app.js';

const isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';

function signal(tagName, attrName, attrValue, attrs) {
  switch(attrName) {
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
    case 'data-url':
      if(App.hasMatchingRoute('GET', attrValue)) {
        let eventName = s.event(attrs) || 'click';
        return [1, 'on' + eventName, attrValue, 'GET'];
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

export default isNode ? function(){} : signal;
