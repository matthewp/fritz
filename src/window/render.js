function renderFor(msg, fritz) {
  let id = msg.id;
  let instance = fritz._instances[msg.id];
  instance.doRenderCallback(msg.tree);
  if(msg.events) {
    instance.observedEventsCallback(msg.events);
  }
}

export { renderFor };