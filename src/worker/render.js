function render(msg, fritz) {
  let id = msg.id;
  let instance = fritz._instances[id];
  let events;
  if(!instance) {
    let constructor = fritz._tags[msg.tag];
    instance = new constructor();
    instance._fritzId = id;
    fritz._instances[id] = instance;
    events = constructor.observedEvents;
  }
  let tree = instance.render();
  postMessage({
    type: 'render',
    id: id,
    tree: tree,
    events: events
  });
}

export default render;