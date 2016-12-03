export default class {
  constructor(request, app) {
    this.request = request;
    this.app = app;
    this.messenger = app.messenger;
  }

  redirect(route) {
    this.app.handle({
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
}
