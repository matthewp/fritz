importScripts('../../worker.umd.js');

const { h } = fritz;
const app = fritz();

let count = 0;

app.post('/count', function(req, res){
  count++;
  res.redirect('/');
});

app.get('*', function(req, res){
  let vdom = h('html', [
    h('head', [
      h('title', ['A test page']),
      h('link', {rel: 'stylesheet', href: './styles.css'})
    ]),
    h('body', [
      h('h1', ['Number of clicks']),
      h('h2', [`Count: ${count}`]),
      h('form', {action: '/count', method: 'POST'}, [
        h('button', ['Increment'])
      ])
    ])
  ]);

  res.push(vdom);
});
