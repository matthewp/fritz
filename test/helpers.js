makeTestHelpers = function(win){
  return {
      instanceCount() {
      return Object.keys(win.fritz._instances).length;
    }
  };
};