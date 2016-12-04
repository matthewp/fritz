export default function(){
  return getState(document.documentElement);
}

function getState(node) {
  switch(node.nodeType) {
    // Element
    case 1:
      let bc = [node.nodeName.toLowerCase()];
      if(node.hasAttributes() ) {
        bc.push(Array.prototype.reduce.call(node.attributes, function(out, attr){
          out[attr.name] = attr.value;
        }, {}));
      } else {
        bc.push(null);
      }
      if(node.firstChild) {
        bc.push(Array.prototype.map.call(node.childNodes, getState));
      }
      return bc;
    // TextNode
    case 3:
      return node.nodeValue;
  }
}
