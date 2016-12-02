export default class {
  constructor(request, messenger) {
    this.request = request;
    this.messenger = messenger;
  }

  end(tree) {
    if(tree[0][1] === 'html') {
      tree.shift();
    }
    if(tree[tree.length - 1][1] === 'html') {
      tree.pop();
    }
    this.messenger.send(tree);
  }
}
