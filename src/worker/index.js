import App from './app.js';
import h from './hyperscript.js';
import Component from './component.js';

const fritz = new App();

fritz.h = h;
fritz.Component = Component;

export {
  fritz as default,
  h,
  Component
};
