importScripts('../../worker.umd.js');

const { h, Component } = fritz;

class AnotherEl extends Component {
  render() {
    return h('div', ['Another el']);
  }
}

fritz.define('another-el', AnotherEl);

class BasicApp extends Component {
  render() {
    return h('div', {id:'root'}, [
      'Hello world!',
      h(AnotherEl)
    ]);
  }
}

fritz.define('basic-app', BasicApp);

/*
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
*/