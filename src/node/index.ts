import fritz from './worker.mjs';

const OPEN = 1;
const CLOSE = 2;
const TEXT = 4;

const encodeEntities = (s: any) => String(s)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;');

function* render(vnode: any): Generator<string, void, unknown> {
  let position = 0, len = vnode.length;
  while(position < len) {
    let instr = vnode[position];
    let command = instr[0];

    switch(command) {
      case OPEN: {
        let tagName = instr[1];
        let Component = fritz._tags.get(tagName);
        let props: Record<string, any> | null = Component ? {} : null;
        let pushProps = props ? (name: string, value: any) => props![name] = value : Function.prototype;

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
          yield* render(instance.render(props as any, {}));
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

function renderToString(vnode: any) {
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
