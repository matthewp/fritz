import signal from './signal.js';

export default function(tag /* children, attrs */){
  var children = Array.prototype.slice.call(arguments, 1);
  var last = children[children.length - 1];
  var attrs, evs;
  if(typeof last !== "string" && !Array.isArray(last)) {
    attrs = children.pop();
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

  children.forEach(function(child){
    if(typeof child === "string") {
      tree.push([4, child]);
      return;
    }

    while(child.length) {
      tree.push(child.shift());
    }
  });

  tree.push([2, tag]);
  return tree;
};
