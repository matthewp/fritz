import { RENDERED } from '../message-types.js';

export let currentComponent;

export function setComponent(component) {
  let previousComponent = currentComponent;
  setComponentTo(component);
  return setComponentTo.bind(null, previousComponent);
};

function setComponentTo(component) {
  currentComponent = component;
}

export function withMounting(Base) {
  return class extends Base {
    constructor() {
      super();
      this._resetComponent = Function.prototype; // placeholder
      this._parentComponent = currentComponent;
      this._renderCount = 0;
    }

    renderer() {
      this._renderCount = 0;
      if(this._parentComponent) {
        this._parentComponent._incrementRender();
      }
    }

    beforeRender() {
      this._resetComponent = setComponent(this);
    }

    afterRender() {
      this._resetComponent();
      this._resetComponent = Function.prototype;

      if(this._parentComponent) {
        this._parentComponent._decrementRender();
      }
    }

    _incrementRender() {
      this._renderCount++;
    }

    _decrementRender() {
      this._renderCount--;

      if(this._renderCount === 0) {
        this._worker.postMessage({
          type: RENDERED,
          id: this._id
        });
      }
    }
  }
}
