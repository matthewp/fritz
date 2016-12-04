import signal from './signal.js';
import h from 'virtual-dom/h';
import isPlainObject from 'lodash.isplainobject';

export default function(tag, attrs, children){
  if(isPlainObject(attrs)) {
    Object.keys(attrs).forEach(name => {
      let moreAttrs = signal(tag, name, attrs[name]);
      if(moreAttrs) {
        Object.assign(attrs, moreAttrs);
      }
    });
  }
  return h(tag, attrs, children);
};
