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
    this.messenger.send(tree);
  }
}
