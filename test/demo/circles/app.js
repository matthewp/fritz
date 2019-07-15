importScripts('../../../worker.umd.js');
importScripts('./styles.js');

const { h, Component } = fritz;

function StartButton() {
  return h('form', {action:'/start', method: 'POST'}, [
    h('button', ['Start'])
  ]);
}

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

class CirclesDemo extends Component {
  static get events() {
    return ['submit'];
  }

  constructor() {
    super();
    this.id = null;
    this.count = 0;
  }

  onSubmit() {
    this.id = setInterval(_ => {
      this.setState({});

      if(this.count >= 1000) {
        clearInterval(this.id);
        this.id = null;
        this.count = 0;
      }
    }, 1);
  }

  render() {
    if(!this.id) {
      return StartButton();
    }

    this.count++;
    var boxes = [];
    for(var i = 0; i < 100; i++) {
      boxes.push(Box(i, this.count));
    }

    return h('div', [
      Styles(),
      StartButton(),
      h('div', boxes)
    ]);
  }
}

fritz.define('circles-demo', CirclesDemo);
