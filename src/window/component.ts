import { withUpdate } from '@matthewp/skatejs/dist/esnext/with-update';
import { withMount } from './with-mount.js';
import { withWorkerEvents } from './with-worker-events.js';
import { withWorkerRender } from './with-worker-render.js';

export function withComponent({ mount }) {
  let Base = withWorkerEvents(
    withWorkerRender(
      withUpdate(HTMLElement)
    )
  );

  if(mount) {
    Base = withMount(Base);
  }

  return Base;
};
