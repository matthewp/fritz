function render(msg, fritz) {
  let id = msg.id;
  let instance = fritz._instances[id];
  if(!instance) {
    instance = new fritz._tags[msg.tag]();
  }
  let vdom = instance.render();
  postMessage({
    type: 'render',
    id: id,
    vdom: vdom
  });
}

export default render;