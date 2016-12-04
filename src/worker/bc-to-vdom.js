function getVdom(bc){
  if(typeof bc === 'string') {
    return bc;
  }
  let children = bc[2] ? bc[2].map(getVdom) : undefined;
  return h(bc[0], bc[1], children);
}

export default getVdom;
