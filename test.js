
fetch('./cnn.json')
.then(function(resp){
  return resp.json();
})
.then(function(stack){
  test1(stack);

  setTimeout(function(){
    test1(stack);
  }, 1000);
});

function test1(stack) {
  stack = stack[0].childNodes;

  var start = new Date();
  var bc = serialize1(stack);
  console.log('Serialize', new Date() - start);

  postMessage({
    start: start,
    bc: bc
  });
}

function serialize1(stack, bc = []) {
  var i, j, len, node;

  for(i = 0, len = stack.length; i < len; i++) {
    node = stack[i];
    switch(node.nodeType) {
      case 1:
        var tn = node.tagName.toLowerCase();
        bc.push([1, tn,
          serializeAttrs1(node.attributes)]);
        serialize1(node.childNodes, bc);
        bc.push([2, tn]);
        break;
      case 3:
        bc.push([4, node.nodeValue]);
        break;
    }
  }

  return bc;
}

function serializeAttrs1(attributes) {
  if(!attributes.length) {
    return null;
  }
  var out = [], attr;
  for(var i = 0, len = attributes.length; i < len; i++) {
    attr = attributes[i];
    out.push(attr.name);
    out.push(attr.value);
  }
  return out;
}
