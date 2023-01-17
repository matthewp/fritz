import type { Tree } from '../worker/tree';
import fritz from './worker.mjs';

const OPEN = 1;
const CLOSE = 2;
const TEXT = 4;

const encodeEntities = (s: any) => String(s)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;');

function renderStyle(text: string) {
  return `<style data-fritz-s>${text}</style>`;
}

type FritzTagMap = typeof fritz._tags;
type ComponentConstructor = FritzTagMap extends Map<any, infer I> ? I : never;
type ComponentStyles = NonNullable<ComponentConstructor['styles']>;

function * renderStyles(styles: ComponentStyles): Generator<string, void, unknown> {
  if(typeof styles === 'string') {
    yield renderStyle(styles);
  } else {
    for(let defn of styles) {
      if(typeof defn === 'string') {
        yield renderStyle(defn);
      } else {
        // TODO
      }
    }
  }
} 

function* render(vnode: Tree): Generator<string, void, unknown> {
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
          yield '<template shadowroot="open">';
          if(Component.styles) {
            yield * renderStyles(Component.styles);
          }
          let instance = new Component();
          instance.componentWillReceiveProps(props!);
          instance.props = props!;
          yield* render(instance.render(props!, {}) as Tree);
          yield '</template>';
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

function renderToString(vnode: Tree) {
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
