class Component {
  dispatch(ev) {
    this._app.dispatch(this, ev);
  }
}

export default Component;
