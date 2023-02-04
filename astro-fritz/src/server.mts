import { renderToString } from 'fritz/node';
import { h, Component as FritzComponent } from 'fritz';

function check(Component: any) {
  return FritzComponent.isPrototypeOf(Component);
}

type AstroChildren = { default?: string; }

function renderToStaticMarkup(Component: any, props: Record<string, any>, children: AstroChildren) {
  let _props = Object.assign({}, props);
  if(children.default) {
    _props.children = children.default;
  }

  let tree = h(Component, _props);
  let html = renderToString(tree);
  return {
    html
  };
}

export default {
  check,
  renderToStaticMarkup
}