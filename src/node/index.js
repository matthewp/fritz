import fritz from '../../worker';

const OPEN = 1;
const CLOSE = 2;
const TEXT = 4;

const encodeEntities = s => String(s)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;');

function* render(vnode) {
  let position = 0, len = vnode.length;
  while(position < len) {
    let instr = vnode[position];
    let command = instr[0];

    switch(command) {
      case OPEN: {
        let tagName = instr[1];
        let Component = fritz._tags.get(tagName);
        let props = Component ? {} : null;
        let pushProps = props ? (name, value) => props[name] = value : Function.prototype;

        yield '<' + tagName;
        let attrs = instr[3];
        let i = 0, attrLen = attrs ? attrs.length : 0;
        while(i < attrLen) {
          if(i === 0) {
            yield ' ';
          }
          let attrName = attrs[i];
          let attrValue = attrs[i + 1];
          pushProps(attrName, attrValue);
          yield attrName + '="' + encodeEntities(attrValue) + '"';
          i += 2;
        }
        yield '>';

        
        if(Component) {
          yield '<template>';
          let instance = new Component();
          yield* render(instance.render(props, {}));
          yield '</template><f-shadow></f-shadow>';
        }

        break;
      }
      case CLOSE: {
        yield '</' + instr[1] + '>';
        break;
      }
      case TEXT: {
        yield encodeEntities(instr[1]);
        break;
      }
    }

    position++;
  }
}

function renderToString(vnode) {
  let out = '';
  for(let part of render(vnode)) {
    out += part;
  }
  return out;
}

export {
  render,
  renderToString
};
