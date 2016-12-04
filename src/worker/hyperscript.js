import signal from './signal.js';

export default function(tag, attrs, children){
  const isStringChild = typeof attrs === 'string';
  if(Array.isArray(attrs)|| isStringChild) {
    children = attrs;
    attrs = null;

    if(isStringChild) {
      children = [children];
    }
  }

  if(attrs) {
    var evs;
    attrs = Object.keys(attrs).reduce(function(acc, key){
      var value = attrs[key];
      acc.push(key);
      acc.push(value);

      var eventInfo = signal(tag, key, value)
      if(eventInfo) {
        if(!evs) evs = [];
        evs.push(eventInfo);
      }

      return acc;
    }, []);
  }

  var open = [1, tag];
  if(attrs) {
    open.push(attrs);
  }
  if(evs) {
    open.push(evs);
  }
  var tree = [open];

  if(children) {
    children.forEach(function(child){
      if(typeof child === "string") {
        tree.push([4, child]);
        return;
      }

      while(child.length) {
        tree.push(child.shift());
      }
    });
  }

  tree.push([2, tag]);
  return tree;
};
