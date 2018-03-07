
let queue = new Set();
let markId = null;

function collect(instance) {
  queue.add(instance);
  if(markId === null) {
    markId = setTimeout(runCollection, 40);
  }
}

function runCollection() {
  queue.forEach(function(instance) {
    let handles = instance._fritzHandles;
    handles.forEach(function(handle){
      // Mark
      if(handle.inUse) {
        handle.inUse = false;
      }
      // Sweep
      else {
        handle.del();
        handles.delete(handle.id);
      }
    });
    queue.delete(instance);
  });
  markId = null;
}

export { collect };
