
export function waitForMount(...els) {
  let remaining = els.length;
  return new Promise(resolve => {
    for(let el of els) {
      el.addEventListener('mount', () => {
        remaining--;
        if(remaining === 0) {
          setTimeout(resolve, 50);
        }
      }, { once: true });
    }
  });
}

export function waitFor(cb) {
  return new Promise(resolve => {
    let id = setInterval(() => {
      if(cb()) {
        clearInterval(id);
        resolve();
      }
    }, 10);
  });
}