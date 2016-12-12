importScripts('../../worker.umd.js');

const app = fritz();
const h = fritz.h;

app.get('/other', function(req, res){
  let dom = h('html', [
    h('head', [
      h('title', ['Some app'])
    ]),
    h('body', [
      h('div', {id: 'other'}, ['Other page'])
    ])
  ]);

  res.push(dom);
});

app.get('*', function(req, res){
  let dom = h('html', [
    h('head', [
      h('title', ['Some app'])
    ]),
    h('body', [
      h('div', {id:'main'}, ['Hello world!']),
      h('a', { href: '/other'}, ['Click me'])
    ])
  ]);

  res.push(dom);
});
