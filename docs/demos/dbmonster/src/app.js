import fritz, { Component, h } from '../../../../worker.js';
import './row.js';
import styles from './app.css';

importScripts('https://cdn.rawgit.com/WebReflection/dbmonster/master/data.js');

class App extends Component {
  constructor() {
    super();

    this.dbs = getData();
    //this.updateOften();
  }

  updateOften() {
    setInterval(_ => {
      this.dbs = getData();
      this.update();
    }, 100);
  }

  render() {
    var dbs = this.dbs;

    return h('div', [
      h('style', [styles]),
      h('div', {'class':'table table-striped latest-data'}, [
        h('div', {'class': 'tbody'}, dbs.map(db => h('table-row', {db: db})))
      ])
    ]);
  }
}

fritz.define('db-monster', App);