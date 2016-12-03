importScripts('../../worker.js');

const { makeApp, h } = framework;
const app = makeApp();

let count = 0;

app.get('/', function(req, res){
  let vdom = h('html',
    h('head',
      h('title', 'A test page'),
      h('link', {rel: 'stylesheet', 'href': './styles.css'})),
    h('body', h('h1', 'Number of clicks'),
      h('h2', `Count: ${count}`),
      h('form',
        h('button', 'Increment'),
        {action: '/count'})));

  res.push(vdom);
});

app.post('/count', function(req, res){
  count++;
  res.redirect('/');
});
