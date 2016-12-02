import App from './app.js';
import h from './hyperscript.js';

function makeApp() {
  return new App();
}

export default {
  h,
  makeApp
};
