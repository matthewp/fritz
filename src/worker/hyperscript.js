

export default function(tag /* children, attrs */){
  var children = Array.prototype.slice.call(arguments, 1);
  var last = children[children.length - 1];
  var attrs;
  if(typeof last !== "string" && !Array.isArray(last)) {
    attrs = children.pop();
    attrs = Object.keys(attrs).reduce(function(acc, key){
      acc.push(key);
      acc.push(attrs[key]);
      return acc;
    }, []);
  }

  var tree = [[1, tag, attrs]];

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
