importScripts('./worker.js');

const { makeApp, h } = framework;
const app = makeApp();

app.get('/foo', function(request, response){
  let vdom = h('html',
    h('head', h('title', 'A test page')),
    h('body', h('h1', 'Hello World!'),
      h('p', 'look at me now!'),
      h('a', 'Click me', {'href': '/bar'})));

  response.end(vdom);
});
