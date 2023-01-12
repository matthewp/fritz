import fritz, { Component, h } from '../../../../worker.js';
import './row.js';
import styles from './app.css';

importScripts('./src/data.js');

class App extends Component {
  static get props() {
    return { counter: {} };
  }

  constructor() {
    super();
  }

  render() {
    var dbs = getData();

    return h('div', [
      h('style', [styles]),
      h('div', {'class':'table table-striped latest-data'}, [
        h('div', {'class': 'tbody'}, dbs.map(db => h('table-row', {db: db, key: db.name})))
      ])
    ]);
  }
}

fritz.define('db-monster', App);