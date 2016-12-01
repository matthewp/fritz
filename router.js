importScripts('./worker.js');
importScripts('./hyperscript.js');

router.get('/foo', function(request, response){
  let vdom = h('html',
    h('head', h('title', 'A test page')),
    h('body', h('h1', 'Hello World!'),
      h('p', 'look at me now!')));

  response.end(vdom);
});
