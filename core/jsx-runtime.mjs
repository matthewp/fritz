import { h, Fragment } from './worker.mjs';

function jsx(type, props, key, __self, __source) {
  let children = null;
  if(props.children) {
    children = props.children;
    delete props.children;
  }
  if(key) {
    props.key = key;
  }

  return h(type, props, children);
}

export {
  jsx,
  jsx as jsxs,
  jsx as jsxDEV,
  Fragment
};