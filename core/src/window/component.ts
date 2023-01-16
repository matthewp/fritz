import type { MountBase } from './types';
import type { WindowFritz } from '../types';
import type { DefineMessage } from '../message-types';

import { withUpdate } from '@matthewp/skatejs/dist/esnext/with-update';
import { withMount } from './with-mount.js';
import { withWorkerEvents } from './with-worker-events.js';
import { withWorkerRender } from './with-worker-render.js';
import { withWorkerConnection } from './with-worker-connection.js';
import { withAdopt } from './with-adopt';

const Base = withWorkerEvents(
  withWorkerRender(
    withUpdate(HTMLElement)
  )
);

export function withComponent(
  fritz: WindowFritz,
  worker: Worker,
  msg: DefineMessage
) {
  let {
    props = {},
    events = [],
    features: { mount }
  } = msg;
  let ComponentElement = Base;
  if(mount) {
    ComponentElement = withMount(ComponentElement) as any;
  }
  if(true) {
    ComponentElement = withAdopt(fritz, msg.adopt, ComponentElement) as any;
  }
  return withWorkerConnection(fritz, events, props, worker, ComponentElement) as MountBase;
};
