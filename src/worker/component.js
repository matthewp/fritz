class Component {
  dispatch(ev) {
    this._app.dispatch(this, ev);
  }

  update() {
    this._app.update(this);
  }
}

export default Component;
