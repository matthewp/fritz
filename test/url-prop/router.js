importScripts('../../worker.umd.js');

const app = fritz();
const h = fritz.h;

app.get('/foo', function(req, res){
  let vdom = h('html', [
    h('body', [
      h('div', {id:'worked'}, ['It worked!'])
    ])
  ]);
  res.push(vdom);
});

app.get('*', function(req, res){
  let vdom = h('html', [
    h('body', [
      h('div', {
        'data-url': '/foo',
        'data-event': 'click'
      }, ['Click me'])
    ])
  ]);

  res.push(vdom);
});
