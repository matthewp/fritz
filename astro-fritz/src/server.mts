import { renderToString } from 'fritz/node';
import { h, Component as FritzComponent } from 'fritz';

function check(Component: any) {
  return FritzComponent.isPrototypeOf(Component);
}

function renderToStaticMarkup(Component: any, props: Record<string, any>) {
  let tree = (h as any)(Component, props);
  let html = renderToString(tree);
  return {
    html
  };
}

export default {
  check,
  renderToStaticMarkup
}