import { currentInstance } from './instance.js';
import { isWorker } from './env.js';
import Handle from './handle.js';

const eventAttrExp = /^on[A-Z]/;

function signal(_tagName: string, attrName: string, attrValue: any, attrs: Record<string, any>) {
  if(eventAttrExp.test(attrName)) {
    if(!isWorker) {
      return [];
    }

    let eventName = attrName.toLowerCase();
    let handle = Handle.from(attrValue);
    handle.inUse = true;
    currentInstance!._fritzHandles.set(handle.id, handle);
    return [1, eventName, handle.id];
  }
}

export default signal;
