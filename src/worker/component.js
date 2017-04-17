class Component {
  dispatch(ev) {
    let id = this._fritzId;
    postMessage({
      type: 'trigger',
      event: ev,
      id: id
    });
  }

  update() {
    //this._app.update(this);
  }
}

export default Component;
