import App from './app.js';
import h from './hyperscript.js';

const fritz = new App();

fritz.h = h;

export { fritz as default, h };
