import {
  attributes,
  elementOpen,
  elementClose,
  symbols,
  text,
  patch
} from 'incremental-dom';

var attributesSet = attributes[symbols.default];
attributes[symbols.default] = preferProps;

function preferProps(element, name, value){
  if(name in element)
    element[name] = value;
  else
    attributesSet(element, name, value);
}

function render(bc, component){
  var n;
  for(var i = 0, len = bc.length; i < len; i++) {
    n = bc[i];
    switch(n[0]) {
      // Open
      case 1:
        if(n[4]) {
          for(var j = 0, jlen = n[4].length; j < jlen; j++) {
            let handler = component.addEventCallback(n[4][j][2]);
            n[3].push(n[4][j][1], handler);
          }
        }

        var openArgs = [n[1], n[2], null].concat(n[3]);
        elementOpen.apply(null, openArgs);
        break;
      case 2:
        elementClose(n[1]);
        break;
      case 4:
        text(n[1]);
        break;
    }
  }
}

function idomRender(vdom, root, component) {
  patch(root, () => render(vdom, component));
}

export { idomRender };