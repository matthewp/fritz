const FN_HANDLE = Symbol('fritz.handle');

const orphans = [];

export function track(fn, handleId) {
  if(!fn[FN_HANDLE]) {
    fn[FN_HANDLE] = handleId;
  }

  return fn;
};

function reset() {
  orphans.length = 0;
}

export function trap() {
  reset();
  return function(){
    let out = Array.from(orphans);
    reset();
    return out;
  };
};

export function mark(fn) {
  orphans.push(fn[FN_HANDLE]);
};
