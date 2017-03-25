class Serializable {
  serialize() {
    let out = Object.create(null);
    return Object.assign(out, this);
  }
}

export default Serializable;
