export default class {
  constructor(request, app) {
    this.request = request;
    this.app = app;
    this.messenger = app.messenger;
    this.isEnded = false;
  }

  redirect(route) {
    this.app.dispatch({
      method: 'GET',
      url: route
    });
  }

  push(tree) {
    if(tree[0][1] === 'html') {
      tree.shift();
    }
    if(tree[tree.length - 1][1] === 'html') {
      tree.pop();
    }
    this.messenger.send(tree);
  }

  end(tree) {
    if(!this.isEnded) {
      this.push(tree);
      this.isEnded = true;
    }
  }
}
