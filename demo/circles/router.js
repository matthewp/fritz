importScripts('../../worker.js');
importScripts('./app.js');

const { makeApp, h } = framework;
const app = makeApp();

function StartButton() {
  return h('form', {action:'/start'}, [
    h('button', 'Start')
  ]);
}

app.get('/', function(req, res){
  let vdom = App(StartButton());
  res.push(vdom);
});

function Box(num, count) {
  var top = Math.sin(count / 10) * 10;
  var left = Math.cos(count / 10) * 10;
  var color = count % 255;
  var content = ""+(count % 100);
  var style = `top: ${top}px; left: ${left}px; background: rgb(0,0,${color});`;

  return h('div', {'class':'box-view'}, [
    h('div', {id:`box-${num}`,'class':'box',style:style}, [ content ])
  ]);
}

app.post('/start', function(req, res){
  var count = 0;
  function render() {
    count++;
    var boxes = [];
    for(var i = 0; i < 100; i++) {
      boxes.push(Box(i, count));
    }

    var vdom = App(
      h('div', [
        StartButton(),
        h('div', boxes)
      ])
    );

    res.push(vdom);

    if(count < 1000) {
      setTimeout(render, 1);
    }
  }

  render();
});
