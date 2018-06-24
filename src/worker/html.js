const templates = new WeakMap();

export default function(strings, ...vals) {
  return [1, strings, 2, vals];
}
