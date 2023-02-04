import { renderToString } from 'fritz/node';
import { h, Component as FritzComponent } from 'fritz';

function check(Component: any) {
  return FritzComponent.isPrototypeOf(Component);
}

type AstroChildren = { default?: string; }

function renderToStaticMarkup(Component: any, props: Record<string, any>, children: AstroChildren) {
  if(children.default) {
    props.children = children.default;
  }

  let tree = h(Component, props);
  let html = renderToString(tree);
  return {
    html
  };
}

export default {
  check,
  renderToStaticMarkup
}