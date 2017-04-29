import {
  elementOpen,
  elementClose,
  text,
  patch
} from 'incremental-dom';

function render(bc, component){
  var n;
  for(var i = 0, len = bc.length; i < len; i++) {
    n = bc[i];
    switch(n[0]) {
      // Open
      case 1:
        if(n[3]) {
          for(var j = 0, jlen = n[3].length; j < jlen; j++) {
            let handler = component.addEventCallback(n[3][j][2]);
            n[2].push(n[3][j][1], handler);
          }
        }

        var openArgs = [n[1], null, null].concat(n[2]);
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