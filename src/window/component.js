import { withUpdate } from '@matthewp/skatejs/dist/esnext/with-update';
import { withMount } from './with-mount.js';
import { withWorkerEvents } from './with-worker-events.js';
import { withWorkerRender } from './with-worker-render.js';
import { EVENT, RENDER } from '../message-types.js';


export function withComponent(options) {
  let Base = withWorkerRender(withUpdate(HTMLElement));

  Base = withWorkerEvents(Base);

  if(options.mount) {
    Base = withMount(Base);
  }

  return Base;
};
