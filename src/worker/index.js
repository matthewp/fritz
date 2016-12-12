import App from './app.js';
import h from './hyperscript.js';

function fritz() {
  return new App();
}

fritz.h = h;

export { fritz as default, h };
