function renderFor(msg, fritz) {
  let id = msg.id;
  let instance = fritz._instances[msg.id];
  instance.doRenderCallback(msg.vdom);
}

export { renderFor };